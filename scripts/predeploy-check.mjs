import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { readFile } from 'node:fs/promises';

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function get(path) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port: 3000, path, method: 'GET' }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

const html = await readFile('public/index.html', 'utf8');
for (const required of ['<meta name="viewport"', 'id="storefronts"', '/api/sale-images']) {
  if (!html.includes(required)) throw new Error(`Missing required frontend marker: ${required}`);
}

const server = spawn(process.execPath, ['server.js'], {
  env: { ...process.env, USE_PLAYWRIGHT: 'false', REFRESH_HOURS: '9999' },
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
server.stdout.on('data', (d) => { output += d.toString(); });
server.stderr.on('data', (d) => { output += d.toString(); });

try {
  await wait(1200);
  const home = await get('/');
  if (home.status !== 200 || !home.body.includes('LUMINA MALL')) throw new Error('Homepage did not respond correctly.');
  const health = await get('/api/health');
  if (health.status !== 200 || !health.body.includes('"total":58')) throw new Error('Health endpoint did not report 58 stores.');
  console.log('[check] OK: homepage, API health endpoint, viewport meta, and frontend markers passed.');
} finally {
  server.kill('SIGTERM');
  await wait(300);
}
