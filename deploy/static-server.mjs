// Zero-dependency static file server for the Care Indeed HH V2 SPA web tier.
//
// Why a hand-rolled server (no express/serve): the runtime image is distroless
// with NO node_modules, which keeps the attack surface and cold-start minimal.
// This file serves the Vite build output in ./dist with:
//   - SPA history fallback (unknown non-asset routes -> index.html) so deep links
//     and browser refresh work for client-side routing.
//   - GET /healthz -> 200 for Cloud Run / load-balancer health checks.
//   - /api/* -> clean JSON 404. This web tier intentionally hosts NO API backend;
//     the canonical auth/API runs elsewhere. Returning JSON (not index.html) means
//     the SPA's auth client surfaces an honest error instead of parsing HTML.
//   - On-the-fly gzip for compressible text assets.
//   - Path-traversal protection (resolved path must stay within ./dist).
//
// Binds 0.0.0.0 on process.env.PORT (default 8080) per Cloud Run contract.

import http from 'node:http';
import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const INDEX = path.join(DIST, 'index.html');
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

const COMPRESSIBLE = new Set([
  'text/html; charset=utf-8',
  'text/javascript; charset=utf-8',
  'text/css; charset=utf-8',
  'application/json; charset=utf-8',
  'image/svg+xml',
  'text/plain; charset=utf-8',
  'application/manifest+json',
]);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function setSecurityHeaders(res) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.setHeader(k, v);
}

function sendJson(res, status, body) {
  setSecurityHeaders(res);
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(payload);
}

function sendFile(req, res, filePath, status = 200, { noCache = false } = {}) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  setSecurityHeaders(res);
  res.setHeader('Content-Type', type);
  // Hashed asset filenames (Vite) are safe to cache long; HTML must revalidate.
  if (noCache || ext === '.html') {
    res.setHeader('Cache-Control', 'no-cache');
  } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }

  const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  const stream = createReadStream(filePath);
  stream.on('error', () => {
    if (!res.headersSent) sendJson(res, 500, { error: { code: 'read_error', message: 'Failed to read asset.' } });
    else res.destroy();
  });

  if (acceptsGzip && COMPRESSIBLE.has(type)) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    res.writeHead(status);
    stream.pipe(zlib.createGzip()).pipe(res);
  } else {
    res.writeHead(status);
    stream.pipe(res);
  }
}

async function resolveWithinDist(urlPath) {
  // Decode, strip query already removed by caller, normalize, and confine to DIST.
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  const rel = decoded.replace(/^\/+/, '');
  const candidate = path.resolve(DIST, rel);
  if (candidate !== DIST && !candidate.startsWith(DIST + path.sep)) {
    return null; // path traversal attempt
  }
  try {
    const st = await fs.stat(candidate);
    if (st.isFile()) return candidate;
    if (st.isDirectory()) {
      const idx = path.join(candidate, 'index.html');
      try {
        const idxSt = await fs.stat(idx);
        if (idxSt.isFile()) return idx;
      } catch { /* fall through */ }
    }
  } catch { /* not found */ }
  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return sendJson(res, 405, { error: { code: 'method_not_allowed', message: 'Method not allowed.' } });
    }

    const pathname = (req.url || '/').split('?')[0];

    if (pathname === '/healthz' || pathname === '/_health') {
      setSecurityHeaders(res);
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('ok');
    }

    // This static web tier hosts NO API. Be explicit and honest about it.
    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return sendJson(res, 404, {
        error: {
          code: 'no_api_backend',
          message: 'No API backend is deployed for this static web tier.',
        },
      });
    }

    const file = await resolveWithinDist(pathname);
    if (file) return sendFile(req, res, file);

    // SPA history fallback: serve index.html for client-side routes.
    return sendFile(req, res, INDEX, 200, { noCache: true });
  } catch {
    return sendJson(res, 500, { error: { code: 'internal_error', message: 'Internal server error.' } });
  }
});

server.listen(PORT, HOST, () => {
  // No secrets in logs.
  console.log(JSON.stringify({ event: 'static_server.started', port: PORT, host: HOST, dist: DIST }));
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    console.log(JSON.stringify({ event: 'static_server.shutdown', signal: sig }));
    server.close(() => process.exit(0));
  });
}
