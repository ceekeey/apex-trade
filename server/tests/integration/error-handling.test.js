import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../src/app.js';

test('Error Handling — Unknown route returns HTTP 404 with standardized JSON', async () => {
  const app = createApp({
    dbChecker: async () => true,
  });

  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/v1/non-existent-endpoint`);
    assert.equal(res.status, 404);

    const body = await res.json();
    assert.equal(body.status, 'error');
    assert.match(body.message, /Resource not found/);
    assert.match(body.message, /\/api\/v1\/non-existent-endpoint/);
  } finally {
    server.close();
  }
});

test('Error Handling — Malformed JSON body returns HTTP 400 with clear error message', async () => {
  const app = createApp({
    dbChecker: async () => true,
  });

  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"invalidJson": unquoted}',
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'error');
    assert.equal(body.message, 'Malformed JSON payload');
  } finally {
    server.close();
  }
});

