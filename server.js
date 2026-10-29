import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const hosts = { kkphim: 'https://phimapi.com', anisrc: 'https://anisrc.top', zophim: 'https://api-zophim.blogspot.com', nguonc: 'https://phim.nguonc.com', phim4k: 'https://vsmov.com' };
const cache = new Map();
const pending = new Map();
let cachedBytes = 0;
async function load(url) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.time < 60000) return hit;
  if (pending.has(url)) return pending.get(url);
  const task = (async () => {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { Accept: 'application/json,text/plain' } });
    const body = await response.text();
    const value = { body, status: response.status, contentType: response.headers.get('content-type') || 'application/json', time: Date.now(), size: Buffer.byteLength(body) };
    if (response.ok && value.size < 2_000_000) {
      if (hit) { cachedBytes -= hit.size; cache.delete(url); }
      cache.set(url, value); cachedBytes += value.size;
      while (cachedBytes > 10_000_000 || cache.size > 100) {
        const key = cache.keys().next().value;
        cachedBytes -= cache.get(key).size; cache.delete(key);
      }
    }
    return value;
  })().finally(() => pending.delete(url));
  pending.set(url, task); return task;
}
app.get('/api/:provider/*', async (req, res) => {
  const host = hosts[req.params.provider];
  if (!host) return res.status(404).json({ error: 'Unknown provider' });
  const suffix = req.params[0];
  const url = new URL('/' + suffix + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''), host);
  if (url.origin !== host) return res.status(400).json({ error: 'Invalid provider path' });
  try {
    const data = await load(url.href);
    res.setHeader('Cache-Control', data.status === 200 ? 'public, max-age=60' : 'no-store');
    res.status(data.status).type(data.contentType).send(data.body);
  } catch {
    res.status(502).json({ error: 'Nguồn phim tạm thời không phản hồi' });
  }
});
app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown API route' }));
app.use('/assets', express.static(path.join(root, 'dist/assets'), { immutable: true, maxAge: '1y' }));
app.use(express.static(path.join(root, 'dist'), { maxAge: 0 }));
app.get('*', (_req, res) => { res.setHeader('Cache-Control', 'no-cache'); res.sendFile(path.join(root, 'dist/index.html')); });
app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log(`TP VietSub: http://localhost:${process.env.PORT || 3000}`));
