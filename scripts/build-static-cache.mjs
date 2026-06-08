import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORES } from '../stores.js';
import { scrapeStore, closeBrowser } from '../scraper.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, 'public');
const outFile = join(publicDir, 'cache.json');
const shouldScrape = /^(1|true|yes|on)$/i.test(process.env.BUILD_LIVE_IMAGES || 'false');
const concurrency = Math.max(1, parseInt(process.env.CONCURRENCY || '4', 10));
const timeoutMs = Math.max(3000, parseInt(process.env.TIMEOUT_MS || '10000', 10));
const usePlaywright = /^(1|true|yes|on)$/i.test(process.env.USE_PLAYWRIGHT || 'false');

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let index = 0;
  const worker = async () => {
    while (index < items.length) {
      const i = index++;
      out[i] = await fn(items[i]);
      await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 250));
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

function fallbackEntries() {
  return Object.fromEntries(
    STORES.map((store) => [store.name, {
      name: store.name,
      category: store.category,
      url: store.url,
      ok: false,
      image: null,
      source: 'static-fallback',
      error: 'No live image cache generated for this deployment.'
    }])
  );
}

await mkdir(publicDir, { recursive: true });

if (!shouldScrape) {
  await writeFile(outFile, JSON.stringify({ lastRefresh: null, refreshing: false, count: STORES.length, stores: fallbackEntries() }, null, 2));
  console.log('[build] BUILD_LIVE_IMAGES=false — deployed themed covers without scraping retailer sites.');
  process.exit(0);
}

try {
  console.log(`[build] Generating static sale-image cache for ${STORES.length} stores · concurrency=${concurrency} · playwright=${usePlaywright}`);
  const results = await mapLimit(STORES, concurrency, (store) => scrapeStore(store, { usePlaywright, timeoutMs }));
  const stores = Object.fromEntries(results.map((result) => [result.name, result]));
  const withImages = results.filter((result) => result.ok && result.image).length;
  await writeFile(outFile, JSON.stringify({ lastRefresh: new Date().toISOString(), refreshing: false, count: STORES.length, stores }, null, 2));
  console.log(`[build] Wrote public/cache.json — ${withImages}/${STORES.length} images cached.`);
} catch (error) {
  console.warn(`[build] Static scrape failed; writing fallback cache instead: ${error.message}`);
  await writeFile(outFile, JSON.stringify({ lastRefresh: null, refreshing: false, count: STORES.length, stores: fallbackEntries() }, null, 2));
} finally {
  await closeBrowser();
}
