# Deployment Guide — LUMINA MALL

## Best choice

For the full feature set, deploy as a **Node web service**. The project is not just a static page; live sale images depend on the server routes:

- `/api/sale-images`
- `/api/sale-image?store=Nike`
- `/api/health`
- `/api/refresh`

A static Netlify deploy is still supported, but it will use themed covers unless you generate a static `public/cache.json` at build time.

## Local deployment test

```bash
cd lumina-mall-deploy-ready
npm install
npm run check
npm start
```

Open:

```text
http://localhost:3000
```

Expected:

- Homepage loads.
- Header appears after clicking **Enter the Mall**.
- Store grid works on desktop/tablet/phone widths.
- Search works.
- Category chips work.
- `/api/health` returns `total: 58`.

## Netlify static deploy

Use this when you want the quickest deployment.

### Git deploy

1. Push this folder to GitHub.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Select the repo.
4. Netlify should read `netlify.toml` automatically.
5. Confirm:
   - Build command: `node scripts/build-static-cache.mjs`
   - Publish directory: `public`
6. Deploy.

### Drag-and-drop deploy

1. Run this locally:

```bash
npm run build
```

2. Upload the `public` folder to Netlify manual deploy.

This is static-only. It will not run `server.js`.

## Full live deploy on Render

1. Push the full project folder to GitHub.
2. In Render, create a new **Web Service**.
3. Connect the repo.
4. Use:

```text
Build command: npm install --omit=dev --omit=optional
Start command: node server.js
```

5. Add environment variables:

```text
NODE_VERSION=20
USE_PLAYWRIGHT=false
REFRESH_HOURS=6
CONCURRENCY=4
TIMEOUT_MS=12000
```

6. Deploy.
7. Visit:

```text
https://your-render-url/api/health
```

Expected response includes:

```json
{
  "ok": true,
  "total": 58
}
```

## Mobile/tablet checklist

Test these screen widths:

- Phone: 390 × 844
- Tablet: 768 × 1024
- Desktop: 1440 × 900

Confirm:

- No horizontal scrolling.
- Store cards stay readable.
- Search box remains usable.
- Category chips wrap cleanly.
- Modal map fits inside the viewport.
- Touch devices do not depend on hover-only effects.

## Domain connection

After deployment, connect your domain through your host:

- Netlify: **Site configuration → Domain management → Add custom domain**
- Render: **Settings → Custom Domains**

Then update your domain DNS records at your registrar.
