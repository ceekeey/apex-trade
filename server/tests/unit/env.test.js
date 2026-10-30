import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnv, envSchema } from '../../src/config/env.js';

test('Environment Validation — Valid Configuration', () => {
  const validConfig = {
    NODE_ENV: 'test',
    PORT: '4000',
    DB_HOST: '127.0.0.1',
    DB_PORT: '3306',
    DB_NAME: 'apex_trade_test',
    DB_USER: 'test_user',
    DB_PASSWORD: 'secret_password_123',
    CLIENT_URL: 'http://localhost:5173',
  };

  const parsed = validateEnv(validConfig);
  assert.equal(parsed.NODE_ENV, 'test');
  assert.equal(parsed.PORT, 4000);
  assert.equal(parsed.DB_HOST, '127.0.0.1');
  assert.equal(parsed.DB_PORT, 3306);
  assert.equal(parsed.DB_NAME, 'apex_trade_test');
  assert.equal(parsed.DB_USER, 'test_user');
  assert.equal(parsed.CLIENT_URL, 'http://localhost:5173');
});

test('Environment Validation — Missing required fields produces clear error without leaking secrets', () => {
  const invalidConfig = {
    NODE_ENV: 'development',
    // Missing DB_NAME and DB_USER
    DB_PASSWORD: 'super_secret_db_password',
  };

  assert.throws(
    () => validateEnv(invalidConfig),
    (err) => {
      assert.match(err.message, /Environment validation failed/);
      assert.match(err.message, /DB_NAME/);
      assert.match(err.message, /DB_USER/);
      // Ensure the secret value itself is never leaked in the error output
      assert.doesNotMatch(err.message, /super_secret_db_password/);
      return true;
    }
  );
});

test('Environment Validation — Invalid port number produces validation error', () => {
  const invalidPortConfig = {
    NODE_ENV: 'development',
    PORT: '999999', // out of range
    DB_NAME: 'apex_trade',
    DB_USER: 'root',
  };

  assert.throws(
    () => validateEnv(invalidPortConfig),
    (err) => {
      assert.match(err.message, /PORT/);
      return true;
    }
  );
});

test('Environment Validation — Applies default values appropriately', () => {
  const minimalConfig = {
    DB_NAME: 'apex_trade_min',
    DB_USER: 'apex_user',
  };

  const parsed = validateEnv(minimalConfig);
  assert.equal(parsed.NODE_ENV, 'development');
  assert.equal(parsed.PORT, 5000);
  assert.equal(parsed.DB_HOST, 'localhost');
  assert.equal(parsed.DB_PORT, 3306);
  assert.equal(parsed.CLIENT_URL, 'http://localhost:5173');
});

