#!/usr/bin/env node
/**
 * review-tool/server.js — tiny local server for manually re-categorizing a
 * batch before merge. No dependencies. Serves the review page + two endpoints:
 *   GET  /data.json   -> the batch (image-pipeline/review-tool/data.json)
 *   POST /save         -> writes corrections to image-pipeline/review-tool/corrections.json
 *
 * Run: node image-pipeline/review-tool/server.js [port]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const PORT = Number(process.argv[2]) || 8842;

function send(res, code, type, body) {
  res.writeHead(code, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    return send(res, 200, 'text/html', fs.readFileSync(path.join(DIR, 'index.html')));
  }
  if (req.method === 'GET' && req.url === '/data.json') {
    return send(res, 200, 'application/json', fs.readFileSync(path.join(DIR, 'data.json')));
  }
  // Local previews for a batch reviewed BEFORE upload (review-tool/previews/{hash8}.webp).
  const pv = req.method === 'GET' && /^\/previews\/([a-f0-9]{8}\.webp)$/.exec(req.url);
  if (pv) {
    const file = path.join(DIR, 'previews', pv[1]);
    return fs.existsSync(file) ? send(res, 200, 'image/webp', fs.readFileSync(file)) : send(res, 404, 'text/plain', 'not found');
  }
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      fs.writeFileSync(path.join(DIR, 'corrections.json'), body);
      console.log(`✓ saved corrections.json (${JSON.parse(body).length} entries)`);
      send(res, 200, 'application/json', JSON.stringify({ ok: true }));
    });
    return;
  }
  send(res, 404, 'text/plain', 'not found');
});

server.listen(PORT, () => console.log(`review tool on http://localhost:${PORT}`));
