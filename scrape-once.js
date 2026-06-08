// scrape-once.js — run one scrape pass and write cache.json, then exit.
// Useful for cron jobs or a quick "did it work?" check.
import { writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { STORES } from './stores.js';
import { scrapeStore, closeBrowser } from './scraper.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '5', 10);
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '15000', 10);
const USE_PLAYWRIGHT = !/^(0|false|no|off)$/i.test(process.env.USE_PLAYWRIGHT || 'true');

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

(async () => {
  const t0 = Date.now();
  console.log(`Scraping ${STORES.length} stores (playwright=${USE_PLAYWRIGHT})…\n`);
  const results = await mapLimit(STORES, CONCURRENCY, async (s) => {
    const r = await scrapeStore(s, { usePlaywright: USE_PLAYWRIGHT, timeoutMs: TIMEOUT_MS });
    console.log(`${r.ok ? '  ✓' : '  ·'} ${s.name.padEnd(24)} ${r.ok ? r.source : (r.error || '')}`);
    return r;
  });
  const stores = {};
  for (const r of results) stores[r.name] = r;
  await writeFile(join(__dirname, 'cache.json'), JSON.stringify({ lastRefresh: new Date().toISOString(), stores }, null, 2));
  const ok = results.filter((r) => r.ok).length;
  console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s — ${ok}/${results.length} images found → cache.json`);
  await closeBrowser();
  process.exit(0);
})();
