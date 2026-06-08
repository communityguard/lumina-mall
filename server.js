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

function xmlEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function slug(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'store';
}
function hueFor(name, category) {
  let h = 0;
  const seed = `${name}|${category}`;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}
function localCoverUrl(storeName) {
  return `/api/store-cover?store=${encodeURIComponent(storeName)}`;
}
function makeStoreCoverSvg(store) {
  const name = xmlEscape(store?.name || 'LUMINA MALL');
  const category = xmlEscape(store?.category || 'Sale');
  const h = hueFor(store?.name || '', store?.category || '');
  const h2 = (h + 38) % 360;
  const h3 = (h + 210) % 360;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000" role="img" aria-label="${name} sale cover">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${h}, 72%, 28%)"/>
      <stop offset="48%" stop-color="hsl(${h2}, 65%, 20%)"/>
      <stop offset="100%" stop-color="hsl(${h3}, 70%, 16%)"/>
    </linearGradient>
    <radialGradient id="glow" cx="34%" cy="16%" r="68%">
      <stop offset="0%" stop-color="#fff1c2" stop-opacity="0.55"/>
      <stop offset="42%" stop-color="#e8c57e" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="96" height="96" patternUnits="userSpaceOnUse">
      <path d="M 96 0 L 0 0 0 96" fill="none" stroke="#ffffff" stroke-opacity="0.10" stroke-width="2"/>
      <circle cx="18" cy="18" r="3" fill="#ffffff" fill-opacity="0.16"/>
    </pattern>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="1600" height="1000" fill="url(#bg)"/>
  <rect width="1600" height="1000" fill="url(#grid)"/>
  <rect width="1600" height="1000" fill="url(#glow)"/>
  <path d="M-120 840 C220 690 390 760 620 650 C920 508 1180 590 1720 320 L1720 1040 L-120 1040 Z" fill="#000" fill-opacity="0.20"/>
  <g filter="url(#shadow)">
    <rect x="122" y="126" width="1356" height="748" rx="58" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.24" stroke-width="3"/>
    <text x="800" y="248" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="700" letter-spacing="7" fill="#fff5d6" fill-opacity="0.92">LUMINA MALL</text>
    <text x="800" y="520" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="118" font-weight="700" fill="#ffffff">${name}</text>
    <line x1="360" y1="585" x2="1240" y2="585" stroke="#e8c57e" stroke-opacity="0.75" stroke-width="4"/>
    <text x="800" y="682" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="800" letter-spacing="10" fill="#e8c57e">${category} • SALE</text>
    <text x="800" y="758" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#ffffff" fill-opacity="0.72">Tap to visit the live retailer sale page</text>
  </g>
</svg>`;
}
function withGuaranteedCovers() {
  const out = { ...cache };
  for (const store of STORES) {
    const existing = out[store.name];
    if (!existing || !existing.ok || !existing.image) {
      out[store.name] = {
        name: store.name,
        category: store.category,
        url: store.url,
        image: localCoverUrl(store.name),
        source: 'local-cover',
        ok: true,
        status: null,
        error: existing?.error || null,
        ms: existing?.ms || 0,
        fetchedAt: existing?.fetchedAt || new Date().toISOString(),
      };
    }
  }
  return out;
}

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
    {
      const stores = withGuaranteedCovers();
      const liveCount = Object.values(cache).filter((s) => s && s.ok && s.image).length;
      return sendJson(res, 200, { lastRefresh, refreshing, count: Object.keys(stores).length, liveCount, stores });
    }

  if (p === '/api/sale-image' && req.method === 'GET') {
    const name = url.searchParams.get('store');
    const stores = withGuaranteedCovers();
    const entry = stores[name];
    return entry ? sendJson(res, 200, entry) : sendJson(res, 404, { error: 'not-found' });
  }

  if (p === '/api/store-cover' && req.method === 'GET') {
    const name = url.searchParams.get('store') || '';
    const store = STORES.find((s) => s.name === name);
    if (!store) return sendJson(res, 404, { error: 'store-not-found' });
    res.writeHead(200, {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    return res.end(makeStoreCoverSvg(store));
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
