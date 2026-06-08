// scraper.js — ZERO-DEPENDENCY image extractor.
// Pulls a retailer's sale-page hero image from:
//   og:image ▸ twitter:image ▸ link[rel=image_src] ▸ JSON-LD image ▸ largest <img>
// Uses Node's built-in fetch (Node 18+). Playwright fallback is used automatically
// when it's installed (see README). Per-store image overrides come from overrides.js.

import { getOverride } from './overrides.js';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const FETCH_HEADERS = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Upgrade-Insecure-Requests': '1',
};

// ---------- low-level fetch ----------
async function fetchHtml(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: FETCH_HEADERS, redirect: 'follow', signal: controller.signal });
    const status = res.status;
    const finalUrl = res.url || url;
    if (!res.ok) return { ok: false, status, finalUrl, html: null };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('html')) return { ok: false, status, finalUrl, html: null, note: 'non-html' };
    return { ok: true, status, finalUrl, html: await res.text() };
  } finally {
    clearTimeout(timer);
  }
}

function absolutize(src, base) {
  try { return new URL(String(src).trim(), base).href; } catch { return null; }
}

// ---------- tiny regex helpers (no DOM library needed) ----------
function findMetaContent(html, keyRe) {
  const tagRe = /<meta\b[^>]*>/gi;
  let m;
  while ((m = tagRe.exec(html))) {
    if (keyRe.test(m[0])) {
      const c = m[0].match(/\bcontent\s*=\s*["']([^"']*)["']/i);
      if (c && c[1]) return c[1];
    }
  }
  return null;
}
function findLinkHref(html, relValue) {
  const tagRe = /<link\b[^>]*>/gi;
  const relRe = new RegExp(`\\brel\\s*=\\s*["']${relValue}["']`, 'i');
  let m;
  while ((m = tagRe.exec(html))) {
    if (relRe.test(m[0])) {
      const h = m[0].match(/\bhref\s*=\s*["']([^"']*)["']/i);
      if (h && h[1]) return h[1];
    }
  }
  return null;
}
function findJsonLdImages(html) {
  const out = [];
  const re = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const data = JSON.parse(m[1].trim());
      for (const node of Array.isArray(data) ? data : [data]) {
        if (!node) continue;
        const img = node.image || node.logo;
        if (typeof img === 'string') out.push(img);
        else if (Array.isArray(img) && img.length) out.push(typeof img[0] === 'string' ? img[0] : img[0]?.url);
        else if (img && img.url) out.push(img.url);
      }
    } catch { /* malformed JSON-LD — skip */ }
  }
  return out.filter(Boolean);
}
function findImgs(html) {
  const out = [];
  const re = /<img\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const src =
      (tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i) || [])[1] ||
      (tag.match(/\bdata-src\s*=\s*["']([^"']+)["']/i) || [])[1] ||
      ((tag.match(/\bsrcset\s*=\s*["']([^"']+)["']/i) || [])[1] || '').split(',').pop()?.trim().split(' ')[0];
    if (!src) continue;
    const width = parseInt((tag.match(/\bwidth\s*=\s*["']?(\d+)/i) || [])[1] || '0', 10);
    const alt = ((tag.match(/\balt\s*=\s*["']([^"']*)["']/i) || [])[1] || '').toLowerCase();
    out.push({ src, width, alt });
  }
  return out;
}

// ---------- pick the best image (exported for testing) ----------
export function pickImageFromHtml(html, baseUrl) {
  const candidates = [];
  const push = (val, score, kind) => {
    if (!val) return;
    const abs = absolutize(val, baseUrl);
    if (abs && /^https?:\/\//i.test(abs)) candidates.push({ url: abs, score, kind });
  };

  // Open Graph / Twitter — the strongest signals.
  push(findMetaContent(html, /\b(?:property|name)\s*=\s*["']og:image:secure_url["']/i), 100, 'og:image:secure_url');
  push(findMetaContent(html, /\b(?:property|name)\s*=\s*["']og:image["']/i), 96, 'og:image');
  push(findMetaContent(html, /\b(?:name|property)\s*=\s*["']twitter:image(?::src)?["']/i), 86, 'twitter:image');
  push(findLinkHref(html, 'image_src'), 70, 'image_src');

  // Structured data.
  for (const img of findJsonLdImages(html)) push(img, 62, 'ld+json');

  // Fallback: prominent / sale-flavored <img>.
  for (const im of findImgs(html)) {
    let score = 8;
    if (/sale|deal|clearance|offer|%\s*off|save|markdown/.test(im.alt)) score += 16;
    if (im.width >= 600) score += 12;
    else if (im.width >= 300) score += 6;
    push(im.src, score, 'img');
  }

  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);

  // Skip sprites / tracking pixels.
  const best =
    candidates.find(
      (c) =>
        !/\.svg(\?|$)/i.test(c.url) &&
        !/(^|[/_-])(pixel|1x1|spacer|blank|transparent)([/_.-]|$)/i.test(c.url),
    ) || candidates[0];
  return best;
}

// ---------- Playwright fallback (lazy; auto-used when installed) ----------
let _browser = null;
let _pwState = 'unknown'; // 'unknown' | 'ready' | 'missing'

async function getBrowser() {
  if (_browser) return _browser;
  if (_pwState === 'missing') return null;
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    _pwState = 'missing';
    console.warn('[playwright] not installed — using HTTP-only scraping.');
    console.warn('            Enable the browser fallback with:  npm install playwright && npx playwright install chromium');
    return null;
  }
  try {
    _browser = await chromium.launch({ headless: true });
    _pwState = 'ready';
    console.log('[playwright] headless browser ready — fallback enabled');
    return _browser;
  } catch (e) {
    _pwState = 'missing';
    console.warn('[playwright] could not launch a browser (' + e.message + ') — using HTTP-only. Try: npx playwright install chromium');
    return null;
  }
}

async function scrapeWithPlaywright(store, opts = {}) {
  const browser = await getBrowser();
  if (!browser) return { ok: false, error: 'playwright-unavailable' };
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1280, height: 900 }, locale: 'en-US' });
  const page = await ctx.newPage();
  try {
    await page.goto(store.url, { waitUntil: 'domcontentloaded', timeout: opts.timeoutMs || 25000 });
    await page.waitForTimeout(1500);
    const pick = pickImageFromHtml(await page.content(), page.url());
    if (pick) return { ok: true, image: pick.url, source: 'playwright:' + pick.kind, status: 200 };
    return { ok: false, error: 'no-image-found(pw)' };
  } finally {
    await ctx.close();
  }
}

export async function closeBrowser() {
  if (_browser) { await _browser.close().catch(() => {}); _browser = null; }
}

// ---------- main entry ----------
function result(store, started, data) {
  return {
    name: store.name,
    category: store.category,
    url: store.url,
    image: data.image || null,
    source: data.source || null,
    ok: !!data.ok,
    status: data.status ?? null,
    error: data.error || null,
    ms: Date.now() - started,
    fetchedAt: new Date().toISOString(),
  };
}

// Run the live scrape (HTTP, then optional Playwright) and return a plain data object.
async function doScrape(store, opts) {
  try {
    const r = await fetchHtml(store.url, opts.timeoutMs);
    if (r.ok && r.html) {
      const pick = pickImageFromHtml(r.html, r.finalUrl);
      if (pick) return { ok: true, image: pick.url, source: pick.kind, status: r.status };
      if (opts.usePlaywright) {
        const pw = await scrapeWithPlaywright(store, opts).catch((e) => ({ ok: false, error: e.message }));
        if (pw?.ok) return pw;
      }
      return { ok: false, status: r.status, error: 'no-image-found' };
    }
    if (opts.usePlaywright) {
      const pw = await scrapeWithPlaywright(store, opts).catch((e) => ({ ok: false, error: e.message }));
      if (pw?.ok) return pw;
    }
    return { ok: false, status: r.status, error: r.note || 'http-' + r.status };
  } catch (e) {
    if (opts.usePlaywright) {
      const pw = await scrapeWithPlaywright(store, opts).catch(() => null);
      if (pw?.ok) return pw;
    }
    return { ok: false, error: e.name === 'AbortError' ? 'timeout' : e.message };
  }
}

export async function scrapeStore(store, opts = {}) {
  const started = Date.now();
  const ov = getOverride(store.name);

  // 'always' override → use the pinned image and skip the network entirely.
  if (ov && ov.mode === 'always') {
    return result(store, started, { ok: true, image: ov.image, source: 'override' });
  }

  const data = await doScrape(store, opts);

  // 'fallback' override → only used when the live scrape came up empty.
  if (!data.ok && ov) {
    return result(store, started, { ok: true, image: ov.image, source: 'override:fallback', status: data.status });
  }
  return result(store, started, data);
}
