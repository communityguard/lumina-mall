import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORES } from '../stores.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDir = join(root, 'public');
const emptyStores = Object.fromEntries(
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

await mkdir(publicDir, { recursive: true });
await writeFile(
  join(publicDir, 'cache.json'),
  JSON.stringify({ lastRefresh: null, refreshing: false, count: STORES.length, stores: emptyStores }, null, 2)
);
console.log(`[build] Wrote public/cache.json with ${STORES.length} themed-cover fallback entries.`);
