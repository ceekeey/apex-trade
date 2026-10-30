import test from 'node:test';
import assert from 'node:assert/strict';
import { testConnection } from '../../src/config/database.js';

test('MySQL Live Integration Test (Requires live MySQL service)', async (t) => {
  try {
    const isConnected = await testConnection();
    assert.equal(isConnected, true);
  } catch (err) {
    t.skip(`MySQL database is not reachable locally (${err.code || err.message}). Skipping live DB integration test.`);
  }
});

