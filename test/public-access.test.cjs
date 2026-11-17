const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { randomBytes } = require('node:crypto');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const path = require('node:path');

async function listen(server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return server.address().port;
}

test('formulir tanpa login, secret tetap di server, API sensitif tidak diteruskan', async () => {
  const secret = randomBytes(32).toString('hex');
  const requests = [];
  const upstream = http.createServer((req, res) => {
    requests.push({ method: req.method, url: req.url, secret: req.headers['x-glink-secret'], auth: req.headers.authorization });
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  });
  let frontend;
  try {
    const backendPort = await listen(upstream);
    const reserved = http.createServer();
    const port = await listen(reserved);
    await new Promise(resolve => reserved.close(resolve));
    const env = { ...process.env,
      BACKEND_URL: `http://127.0.0.1:${backendPort}/function-prefix`, BACKEND_API_SECRET: secret,
      // Stale Vercel settings must no longer cause a password prompt.
      APP_ACCESS_USER: 'old-user', APP_ACCESS_PASSWORD: randomBytes(24).toString('hex'),
    };
    delete env.VERCEL;
    frontend = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
      cwd: path.resolve(__dirname, '..'), env, stdio: ['ignore', 'ignore', 'ignore'],
    });
    const base = `http://127.0.0.1:${port}`;
    for (let i = 0; i < 100; i++) {
      try { await fetch(base); break; }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
      if (i === 99) throw new Error('Next.js gagal start. Jalankan npm run build terlebih dahulu.');
    }
    for (const route of ['/', '/izin', '/cuti', '/dinas']) {
      const response = await fetch(base + route);
      assert.equal(response.status, 200, route);
      assert.equal(response.headers.get('www-authenticate'), null);
    }
    assert.equal((await fetch(base + '/api/health')).status, 200);
    assert.equal((await fetch(base + '/api/pengajuan-dinas/nomor-terbaru')).status, 200);
    const posts = ['/api/pengajuan', '/api/generate-pdf', '/api/pengajuan-dinas', '/api/pengajuan-dinas/preview-pdf', '/api/pengajuan-dinas/generate-pdf', '/api/pengajuan-cuti', '/api/pengajuan-cuti/preview-pdf', '/api/pengajuan-cuti/generate-pdf'];
    for (const route of posts) {
      assert.equal((await fetch(base + route, { method: 'POST', headers: { 'content-type': 'application/json', origin: base }, body: '{}' })).status, 200, route);
    }
    assert.ok(requests.every(req => req.secret === secret && req.auth === undefined));
    assert.equal(requests[0].url, '/function-prefix/api/health');
    const before = requests.length;
    for (const [method, route] of [
      ['GET', '/api/pengajuan'], ['GET', '/api/pengajuan/1'],
      ['GET', '/api/pengajuan/1/pdf'], ['GET', '/api/pengajuan-cuti'], ['GET', '/api/pengajuan-dinas'],
      ['PUT', '/api/pengajuan/1/approval'], ['DELETE', '/api/pengajuan/1'], ['GET', '/uploads/lampiran-test.png'],
    ]) {
      const response = await fetch(base + route, { method });
      assert.equal(response.status, 403, route);
      assert.equal(response.headers.get('www-authenticate'), null);
    }
    assert.equal((await fetch(base + '/api/pengajuan', { method: 'POST', headers: { origin: 'https://untrusted.example', 'content-type': 'application/json' }, body: '{}' })).status, 403);
    assert.equal(requests.length, before, 'Request terlarang tidak boleh mencapai backend.');
  } finally {
    if (frontend && frontend.exitCode === null) {
      const stopped = once(frontend, 'exit'); frontend.kill('SIGTERM'); await stopped;
    }
    await new Promise(resolve => upstream.close(resolve));
  }
});
