#!/usr/bin/env node
/**
 * Zero-dependency static server — run TouchAI anywhere Node runs.
 * Usage: node scripts/serve.mjs [dir] [port]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(
  process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist'),
);
const port = Number(process.env.PORT || process.argv[3] || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.wasm': 'application/wasm',
  '.ico': 'image/x-icon',
};

function send(res, status, body, type = 'text/plain') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': status === 200 && type.includes('javascript') ? 'public, max-age=31536000' : 'no-cache',
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  let filePath = path.join(root, decodeURIComponent(url.pathname));
  if (filePath.endsWith(path.sep) || !path.extname(filePath)) {
    filePath = path.join(path.extname(filePath) ? filePath : filePath, 'index.html');
    if (!fs.existsSync(filePath)) filePath = path.join(root, 'index.html');
  }
  if (!filePath.startsWith(root)) return send(res, 403, 'Forbidden');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback
      return fs.readFile(path.join(root, 'index.html'), (e2, html) => {
        if (e2) return send(res, 404, 'Not found');
        send(res, 200, html, TYPES['.html']);
      });
    }
    send(res, 200, data, TYPES[path.extname(filePath)] || 'application/octet-stream');
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`TouchAI · deploy anywhere · http://0.0.0.0:${port}`);
  console.log(`Serving ${root}`);
});
