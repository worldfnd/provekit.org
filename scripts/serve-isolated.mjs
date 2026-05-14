#!/usr/bin/env node
/**
 * Static dev preview that sets Cross-Origin Isolation headers (COOP + COEP)
 * so the in-browser ZK prover can use SharedArrayBuffer + threaded WASM.
 *
 * Astro's `preview` command doesn't forward Vite's preview.headers config,
 * so we drive the static dist/ output ourselves. Mirrors the production
 * Cloudflare _headers config in public/_headers.
 *
 * Usage: pnpm build && node scripts/serve-isolated.mjs
 */

import { createServer } from 'http';
import { readFile, stat } from 'fs/promises';
import { extname, join, resolve, normalize, sep } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', 'dist');
const PORT = Number.parseInt(process.env.PORT || '4321', 10);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.toml': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.pkp': 'application/octet-stream',
  '.pkv': 'application/octet-stream',
};

function safeJoin(root, urlPath) {
  // Strip query/hash and decode, then normalize, then ensure it doesn't escape root.
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const joined = join(root, clean);
  const resolved = normalize(joined);
  if (!resolved.startsWith(root + sep) && resolved !== root) return null;
  return resolved;
}

async function tryFile(p) {
  try {
    const s = await stat(p);
    if (s.isDirectory()) return null;
    return s;
  } catch {
    return null;
  }
}

async function resolveFile(reqPath) {
  // Direct hit
  const direct = safeJoin(ROOT, reqPath);
  if (!direct) return null;
  let st = await tryFile(direct);
  if (st) return direct;
  const stripped = reqPath.replace(/\/$/, '');
  // Try index.html under directory
  const htmlIndex = safeJoin(ROOT, stripped + '/index.html');
  if (htmlIndex) {
    st = await tryFile(htmlIndex);
    if (st) return htmlIndex;
  }
  // Try index.js under directory — needed for `import('../../..')` patterns
  // emitted by wasm-bindgen-rayon worker helpers.
  const jsIndex = safeJoin(ROOT, stripped + '/index.js');
  if (jsIndex) {
    st = await tryFile(jsIndex);
    if (st) return jsIndex;
  }
  // Try {reqPath}.html
  const htmlised = safeJoin(ROOT, reqPath + '.html');
  if (htmlised) {
    st = await tryFile(htmlised);
    if (st) return htmlised;
  }
  return null;
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url || '/');
  const headers = {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Cache-Control': 'no-store, must-revalidate',
  };
  if (!file) {
    res.writeHead(404, { ...headers, 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }
  const ext = extname(file).toLowerCase();
  try {
    const data = await readFile(file);
    res.writeHead(200, { ...headers, 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { ...headers, 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`\n  Cross-origin-isolated dev preview ready at http://localhost:${PORT}/`);
  console.log(`  Serving ${ROOT}\n`);
});
