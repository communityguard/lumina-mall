# LUMINA MALL — Deploy-Ready Site

LUMINA MALL is a cinematic virtual mall directory that links visitors to 58 retailer sale pages. The frontend is responsive for desktop, tablet, and phone. It can run in two production modes:

1. **Full Node server mode** — runs `server.js`, serves the site, scrapes sale-page preview images, caches them, and exposes `/api/sale-images`.
2. **Static host mode** — publishes only the `/public` folder. The site still works and remains responsive, but live sale images require either a generated `public/cache.json` or the Node server API.

## Project map

```text
lumina-mall-deploy-ready/
├── public/
│   ├── index.html              # responsive frontend
│   ├── cache.json              # generated at build time; safe to recreate
│   ├── icon.svg                # app icon
│   └── manifest.webmanifest    # phone/tablet install metadata
├── server.js                   # Node web server + API + scheduled scraper
├── scraper.js                  # zero-dependency image extractor + optional Playwright fallback
├── stores.js                   # 58 store names and sale URLs
├── overrides.js                # optional pinned image URLs per store
├── scrape-once.js              # one-time live scrape into cache.json
├── scripts/
│   ├── build-static-cache.mjs   # Netlify/static build cache generator
│   ├── predeploy-check.mjs      # local deployment smoke test
│   └── write-empty-cache.mjs    # create fallback cache entries
├── netlify.toml                # static Netlify deploy config
├── render.yaml                 # Node server deploy config for Render
└── package.json
```

## Local test on your Mac

Requires **Node 18+**.

```bash
unzip lumina-mall-deploy-ready.zip
cd lumina-mall-deploy-ready
npm install
npm run check
npm start
```

Then open:

```text
http://localhost:3000
```

Check the API:

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/sale-images
```

## Deploy option A — Full live version on Render/Railway/Fly

Use this option when you want `/api/sale-images`, scheduled refreshes, and the live image cache to work like the local server.

Render setup:

```text
Build command: npm install --omit=dev
Start command: node server.js
Node version: 20
Environment variables:
  USE_PLAYWRIGHT=false
  REFRESH_HOURS=6
  CONCURRENCY=4
  TIMEOUT_MS=12000
```

After it deploys, visit:

```text
https://your-site-url/api/health
```

You should see `ok: true` and `total: 58`.

### Optional Playwright fallback

Some retailers block simple HTTP scraping. To attempt more live images, set:

```text
USE_PLAYWRIGHT=true
```

Then install Playwright in your hosting build process. Start without Playwright first, confirm the site is live, then add it only if needed.

## Deploy option B — Static Netlify version

Use this option if you want the fastest, easiest Netlify deploy. This publishes `/public` and keeps the responsive themed storefronts working on all devices.

The included `netlify.toml` uses:

```toml
[build]
  publish = "public"
  command = "node scripts/build-static-cache.mjs"
```

By default, `BUILD_LIVE_IMAGES=false`, so Netlify does **not** scrape retailer sites during every deployment. The frontend will show themed storefront covers and remain fully usable.

To let Netlify attempt a one-time static image cache during build, set this environment variable in Netlify:

```text
BUILD_LIVE_IMAGES=true
USE_PLAYWRIGHT=false
```

That creates `public/cache.json` during the build. It is not a live server refresh; it is a static cache generated when the site is deployed.

## Phone and tablet testing

After `npm start`, open the site on your Mac first. Then test on your phone or tablet using your Mac's local network IP address:

```bash
ipconfig getifaddr en0
```

Example:

```text
http://192.168.1.25:3000
```

Your phone/tablet must be on the same Wi-Fi network.

## Overrides for blocked image sites

Edit `overrides.js` when a retailer blocks scraping or hot-linking.

```js
export const OVERRIDES = {
  'Nike': 'https://static.nike.com/example-sale-image.jpg',
  "Macy's": { image: 'https://example.com/macys-sale.jpg', mode: 'fallback' },
};
```

- `always` mode: use the pinned image and skip scraping.
- `fallback` mode: scrape first, use the pinned image only if scraping fails.

Keys must match `stores.js` exactly.

## What was hardened for deployment

- Added static-host fallback: the frontend now tries `/api/sale-images` first, then `/cache.json`.
- Added phone/tablet responsive CSS hardening.
- Added `manifest.webmanifest` and `icon.svg` for mobile install metadata.
- Added `netlify.toml` for static Netlify deployment.
- Added `render.yaml` for a full Node server deployment.
- Added `npm run check` smoke test for homepage + API + parser checks.
- Corrected the deployment instructions so they match the current zero-dependency server.

## Important legal and reliability note

Retailer sale-page scraping may be blocked or restricted by retailer terms, robots rules, bot mitigation, or CDN hot-link settings. The site is designed to fall back gracefully to themed covers. For a production shopping platform with product images/prices, use licensed affiliate/product APIs instead of scraping.

## Reliable long-term cover images

This build includes a local fallback cover endpoint at `/api/store-cover?store=Store%20Name`. The `/api/sale-images` API now guarantees every store has an image: live scraped retailer images are used when available, and a locally generated Lumina Mall SVG cover is used when a retailer blocks scraping or hot-linking. This keeps the site polished on desktop, phone, and tablet even when some retailers block automated access.
