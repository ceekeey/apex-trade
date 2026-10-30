import test from 'node:test';
import assert from 'node:assert/strict';
import { createSequelizeInstance, closeConnection } from '../../src/config/database.js';

test('Database Configuration — Creates Sequelize instance with pool and mysql dialect', () => {
  const instance = createSequelizeInstance({
    database: 'apex_test_db',
    username: 'test_user',
    password: 'test_password',
    host: 'localhost',
    port: 3306,
    logging: false,
    pool: {
      max: 5,
      min: 1,
      acquire: 20000,
      idle: 5000,
    },
  });

  assert.equal(instance.getDialect(), 'mysql');
  assert.equal(instance.config.database, 'apex_test_db');
  assert.equal(instance.config.username, 'test_user');
  assert.equal(instance.config.host, 'localhost');
  assert.equal(instance.config.port, 3306);
  assert.equal(instance.config.pool.max, 5);
  assert.equal(instance.config.pool.min, 1);
  assert.equal(instance.config.pool.acquire, 20000);
  assert.equal(instance.config.pool.idle, 5000);
});

test('Database Configuration — Supports clean connection closure', async () => {
  const instance = createSequelizeInstance({
    database: 'apex_test_db',
    username: 'test_user',
    password: 'test_password',
  });

  // Verify close does not throw
  await assert.doesNotReject(async () => {
    await closeConnection(instance);
  });
});

