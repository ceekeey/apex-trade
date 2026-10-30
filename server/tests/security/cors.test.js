import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';

test('CORS Security — Allowed origin receives appropriate CORS headers', async () => {
  const allowedOrigin = 'http://localhost:5173';
  const app = createApp({
    clientUrl: allowedOrigin,
    dbChecker: async () => true,
  });

  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`, {
      headers: {
        Origin: allowedOrigin,
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), allowedOrigin);
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
  } finally {
    server.close();
  }
});

test('CORS Security — Rejected origin is blocked with HTTP 403 and no allow header', async () => {
  const allowedOrigin = 'http://localhost:5173';
  const maliciousOrigin = 'http://attacker-site.com';

  const app = createApp({
    clientUrl: allowedOrigin,
    dbChecker: async () => true,
  });

  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`, {
      headers: {
        Origin: maliciousOrigin,
      },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.status, 'error');
    assert.equal(body.message, 'Not allowed by CORS');

    // Verify origin header was NOT granted to attacker
    assert.notEqual(res.headers.get('access-control-allow-origin'), maliciousOrigin);
  } finally {
    server.close();
  }
});

