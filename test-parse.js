// test-parse.js — exercises pickImageFromHtml on sample markup (no network).
import { pickImageFromHtml } from './scraper.js';

const cases = [
  {
    name: 'og:image wins',
    base: 'https://shop.example.com/sale',
    html: `<html><head>
      <meta property="og:image" content="https://cdn.example.com/hero-sale.jpg">
      <meta name="twitter:image" content="https://cdn.example.com/tw.jpg">
      </head><body><img src="/tiny.png" width="40"></body></html>`,
    expect: 'https://cdn.example.com/hero-sale.jpg',
    expectKind: 'og:image',
  },
  {
    name: 'relative og:image is absolutized',
    base: 'https://shop.example.com/sale/',
    html: `<html><head><meta property="og:image" content="/img/banner.jpg"></head></html>`,
    expect: 'https://shop.example.com/img/banner.jpg',
  },
  {
    name: 'falls back to twitter:image',
    base: 'https://x.example.com',
    html: `<html><head><meta name="twitter:image" content="https://x.example.com/t.jpg"></head></html>`,
    expect: 'https://x.example.com/t.jpg',
    expectKind: 'twitter:image',
  },
  {
    name: 'JSON-LD image when no meta tags',
    base: 'https://y.example.com',
    html: `<html><head><script type="application/ld+json">
      {"@type":"Product","image":["https://y.example.com/p1.jpg"]}</script></head></html>`,
    expect: 'https://y.example.com/p1.jpg',
    expectKind: 'ld+json',
  },
  {
    name: 'prefers large sale <img> over small/sprite',
    base: 'https://z.example.com',
    html: `<html><body>
      <img src="/sprite.svg">
      <img src="/pixel-1x1.gif" width="1">
      <img src="https://z.example.com/big-sale.jpg" width="1200" alt="Up to 60% off sale">
      </body></html>`,
    expect: 'https://z.example.com/big-sale.jpg',
    expectKind: 'img',
  },
  {
    name: 'returns null when nothing usable',
    base: 'https://empty.example.com',
    html: `<html><body><p>no images here</p></body></html>`,
    expect: null,
  },
];

let pass = 0;
for (const c of cases) {
  const got = pickImageFromHtml(c.html, c.base);
  const url = got ? got.url : null;
  const okUrl = url === c.expect;
  const okKind = !c.expectKind || (got && got.kind === c.expectKind);
  const ok = okUrl && okKind;
  if (ok) pass++;
  console.log(`${ok ? '✓' : '✗'} ${c.name}`);
  if (!ok) console.log(`    expected ${c.expect} (${c.expectKind || 'any'})  got ${url} (${got?.kind})`);
}
console.log(`\n${pass}/${cases.length} parser tests passed`);
process.exit(pass === cases.length ? 0 : 1);
