// overrides.js
// Hard-pin a known-good image URL for any store. Handy for retailers that block
// automated scraping (Nike, Macy's, Lululemon, Sephora, etc.) even with the
// Playwright fallback on.
//
// ── Two forms ─────────────────────────────────────────────────────────────────
//   'Store Name': 'https://…/image.jpg'                          // shorthand → mode 'always'
//   'Store Name': { image: 'https://…/image.jpg', mode: 'fallback' }
//
// ── mode ──────────────────────────────────────────────────────────────────────
//   'always'   (default) → use this image and SKIP scraping for that store.
//                          Fast + 100% reliable. Best for sites that always block.
//   'fallback'           → scrape live first; use this image ONLY if scraping fails.
//                          Best when you'd prefer the live banner but want a safety net.
//
// ── Finding a good URL ──────────────────────────────────────────────────────────
//   • Open the store's sale page, right-click the hero/sale banner → "Copy image address".
//   • Or view-source and copy the <meta property="og:image" content="…"> URL.
//   • Prefer a stable CDN URL with no obvious session token / expiry in the query string.
//   • A ~16:10 (landscape) image looks best in the cover; any size works.
//
// ── Important ───────────────────────────────────────────────────────────────────
//   Keys must match the store names in stores.js EXACTLY — mind apostrophes (Macy's,
//   Kohl's, Dick's Sporting Goods, Spencer's, Claire's) and ampersands (Bath & Body
//   Works, Crate & Barrel, Abercrombie & Fitch, Barnes & Noble).
//
//   You only need to display images you have the right to use. These pins point the
//   browser at the retailer's own CDN; some CDNs block cross-site (hot-link) loads, in
//   which case the tile reverts to its themed cover automatically.

export const OVERRIDES = {
  // ───────── examples — uncomment and replace the URLs ─────────
  // 'Nike':                  'https://static.nike.com/a/images/.../sale-hero.jpg',
  // "Macy's":                { image: 'https://assets.macysassets.com/.../sale.jpg', mode: 'always' },
  // 'Lululemon':             { image: 'https://images.lululemon.com/.../wmtm.jpg', mode: 'fallback' },
  // 'Sephora':               'https://www.sephora.com/.../sale-banner.jpg',
  // 'Bath & Body Works':     'https://www.bathandbodyworks.com/.../sale.jpg',
};

// Normalize any entry to { image, mode }. Returns null if there's no usable override.
export function getOverride(name) {
  const v = OVERRIDES[name];
  if (!v) return null;
  if (typeof v === 'string') {
    return /^https?:\/\//i.test(v) ? { image: v, mode: 'always' } : null;
  }
  if (v && typeof v.image === 'string' && /^https?:\/\//i.test(v.image)) {
    return { image: v.image, mode: v.mode === 'fallback' ? 'fallback' : 'always' };
  }
  return null;
}
