/**
 * @file server.js
 * Production Express Server with Built-in API Proxy, Caching & SPA Fallback
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all incoming requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Proxy for anisrc.top
app.get('/api/anisrc/*', async (req, res) => {
  try {
    const targetPath = req.params[0];
    const targetUrl = `https://anisrc.top/${targetPath}`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    const text = await response.text();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(response.status).send(text);
  } catch (error) {
    console.error('Anisrc proxy error:', error);
    res.status(500).json({ error: 'Proxy failed to fetch from anisrc' });
  }
});

// Proxy for api-zophim.blogspot.com
app.get('/api/zophim/*', async (req, res) => {
  try {
    const targetPath = req.params[0];
    const targetUrl = `https://api-zophim.blogspot.com/${targetPath}`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    const text = await response.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(response.status).send(text);
  } catch (error) {
    console.error('Zophim proxy error:', error);
    res.status(500).json({ error: 'Proxy failed to fetch from zophim' });
  }
});

// Serve Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback all routes to index.html for SPA client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TP VietSub Donghua Server running at http://localhost:${PORT}`);
});
