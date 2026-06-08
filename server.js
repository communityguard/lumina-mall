// server.js — ZERO-DEPENDENCY server (Node 18+ built-in http + fetch).
// Serves the mall frontend, exposes a cached sale-image API, and refreshes on a schedule.
import http from 'http';
import { readFile, writeFile } from 'fs/promises';
import { createReadStream, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, normalize, extname } from 'path';
import { STORES } from './stores.js';
import { scrapeStore, closeBrowser } from './scraper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, 'public');
const CACHE_FILE = join(__dirname, 'cache.json');

// ---- config (override via env) ----
const PORT          = parseInt(process.env.PORT || '3000', 10);
const REFRESH_HOURS = parseFloat(process.env.REFRESH_HOURS || '6');
const REFRESH_MS    = Math.max(0.1, REFRESH_HOURS) * 3600 * 1000;
const CONCURRENCY   = parseInt(process.env.CONCURRENCY || '5', 10);
const TIMEOUT_MS    = parseInt(process.env.TIMEOUT_MS || '15000', 10);
const USE_PLAYWRIGHT= !/^(0|false|no|off)$/i.test(process.env.USE_PLAYWRIGHT || 'true');

// ---- in-memory cache (persisted to cache.json) ----
let cache = {};
let lastRefresh = null;
let refreshing = false;

// concurrency-limited map with polite jitter
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const worker = async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
      await new Promise((r) => setTimeout(r, 250 + Math.random() * 450));
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function loadCache() {
  try {
    const data = JSON.parse(await readFile(CACHE_FILE, 'utf8'));
    cache = data.stores || {};
    lastRefresh = data.lastRefresh || null;
    console.log(`[cache] loaded ${Object.keys(cache).length} entries (last refresh ${lastRefresh || 'n/a'})`);
  } catch {
    console.log('[cache] no cache.json yet — will scrape on startup');
  }
}
async function saveCache() {
  try { await writeFile(CACHE_FILE, JSON.stringify({ lastRefresh, stores: cache }, null, 2)); }
  catch (e) { console.error('[cache] save failed:', e.message); }
}

async function refreshAll() {
  if (refreshing) return;
  refreshing = true;
  const t0 = Date.now();
  console.log(`[scrape] refreshing ${STORES.length} stores · concurrency=${CONCURRENCY} · playwright=${USE_PLAYWRIGHT}`);
  try {
    const results = await mapLimit(STORES, CONCURRENCY, async (store) => {
      const r = await scrapeStore(store, { usePlaywright: USE_PLAYWRIGHT, timeoutMs: TIMEOUT_MS });
      console.log(`[scrape] ${r.ok ? 'OK ' : '·· '} ${store.name.padEnd(24)} ${r.ok ? r.source : (r.error || '')}`);
      return r;
    });
    for (const r of results) cache[r.name] = r;
    lastRefresh = new Date().toISOString();
    await saveCache();
    const ok = results.filter((r) => r.ok).length;
    console.log(`[scrape] done in ${((Date.now() - t0) / 1000).toFixed(1)}s — ${ok}/${results.length} images found`);
  } finally {
    refreshing = false;
  }
}

// ---- helpers ----
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
function serveStatic(res, urlPath) {
  let rel = decodeURIComponent(urlPath);
  if (rel === '/' || rel === '') rel = '/index.html';
  const filePath = normalize(join(PUBLIC, rel));
  if (!filePath.startsWith(PUBLIC)) { res.writeHead(403); return res.end('Forbidden'); }
  if (!existsSync(filePath)) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': MIME[extname(filePath).toLowerCase()] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
}

// ---- routes ----
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;

  if (p === '/api/sale-images' && req.method === 'GET')
    return sendJson(res, 200, { lastRefresh, refreshing, count: Object.keys(cache).length, stores: cache });

  if (p === '/api/sale-image' && req.method === 'GET') {
    const entry = cache[url.searchParams.get('store')];
    return entry ? sendJson(res, 200, entry) : sendJson(res, 404, { error: 'not-found' });
  }

  if (p === '/api/health' && req.method === 'GET') {
    const ok = Object.values(cache).filter((s) => s.ok).length;
    return sendJson(res, 200, { ok: true, refreshing, lastRefresh, cached: Object.keys(cache).length, withImages: ok, total: STORES.length });
  }

  if (p === '/api/refresh' && req.method === 'POST') {
    if (refreshing) return sendJson(res, 202, { status: 'already-running' });
    refreshAll();
    return sendJson(res, 200, { status: 'started' });
  }

  return serveStatic(res, p);
});

server.listen(PORT, async () => {
  console.log(`\n  ✦ LUMINA MALL  →  http://localhost:${PORT}\n`);
  await loadCache();
  const stale = !lastRefresh || Date.now() - new Date(lastRefresh).getTime() > REFRESH_MS;
  if (Object.keys(cache).length === 0 || stale) refreshAll();
  else console.log('[scrape] cache is fresh — skipping initial scrape (POST /api/refresh to force)');
  setInterval(refreshAll, REFRESH_MS);
});

async function shutdown() {
  console.log('\n[server] shutting down…');
  await closeBrowser();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
