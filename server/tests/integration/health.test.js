import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';

test('Health Endpoint — GET /health returns process health status and uptime', async () => {
  const app = createApp({
    dbChecker: async () => true,
  });

  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.ok(typeof body.uptime === 'number');
    assert.ok(body.timestamp);
    assert.ok(!isNaN(Date.parse(body.timestamp)));
  } finally {
    server.close();
  }
});

test('Readiness Endpoint — GET /ready returns 200 when database is reachable', async () => {
  const app = createApp({
    dbChecker: async () => true, // Mocked healthy database check
  });

  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/ready`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.status, 'ready');
    assert.equal(body.database, 'connected');
    assert.ok(body.timestamp);
  } finally {
    server.close();
  }
});

test('Readiness Endpoint — GET /ready returns 503 when database is unavailable without exposing errors', async () => {
  const app = createApp({
    dbChecker: async () => {
      throw new Error('Access denied for user root@localhost (using password: YES)');
    },
  });

  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/ready`);
    assert.equal(res.status, 503);

    const body = await res.json();
    assert.equal(body.status, 'unavailable');
    assert.equal(body.database, 'disconnected');
    assert.ok(body.timestamp);

    // Ensure database error message or credentials are not exposed
    assert.equal(body.message, undefined);
    assert.equal(body.stack, undefined);
    assert.equal(body.error, undefined);
  } finally {
    server.close();
  }
});

