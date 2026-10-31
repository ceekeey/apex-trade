import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnv } from '../../src/config/env.js';

const smtpConfiguration = {
  NODE_ENV: 'test',
  DB_NAME: 'apex_trade_test',
  DB_USER: 'test_user',
  SMTP_HOST: 'mail.apextrade.name.ng',
  SMTP_PORT: '465',
  SMTP_SECURE: 'true',
  SMTP_USER: 'support@apextrade.name.ng',
  SMTP_PASS: 'unit-test-password',
  SMTP_FROM: 'Apex Trade <support@apextrade.name.ng>',
};

test('SMTP environment — accepts valid implicit TLS configuration', () => {
  const parsed = validateEnv(smtpConfiguration);

  assert.equal(parsed.SMTP_HOST, 'mail.apextrade.name.ng');
  assert.equal(parsed.SMTP_PORT, 465);
  assert.equal(parsed.SMTP_SECURE, true);
  assert.equal(parsed.SMTP_USER, 'support@apextrade.name.ng');
  assert.equal(parsed.SMTP_FROM, 'Apex Trade <support@apextrade.name.ng>');

  const whitespacePassword = validateEnv({
    ...smtpConfiguration,
    SMTP_PASS: ' unit-test-password ',
  });
  assert.equal(whitespacePassword.SMTP_PASS, ' unit-test-password ');
});

test('SMTP environment — rejects an invalid integer port', () => {
  assert.throws(
    () => validateEnv({ ...smtpConfiguration, SMTP_PORT: '465.5' }),
    (error) => {
      assert.match(error.message, /SMTP_PORT/);
      return true;
    }
  );
});

test('SMTP environment — rejects missing required fields when partially configured', () => {
  const { SMTP_PASS, SMTP_FROM, ...partialConfiguration } = smtpConfiguration;

  assert.throws(
    () => validateEnv(partialConfiguration),
    (error) => {
      assert.match(error.message, /SMTP_PASS/);
      assert.match(error.message, /SMTP_FROM/);
      assert.equal(error.message.includes(SMTP_PASS), false);
      return true;
    }
  );
});

test('SMTP environment — rejects invalid boolean representations and sender addresses', () => {
  assert.throws(
    () => validateEnv({ ...smtpConfiguration, SMTP_SECURE: 'yes' }),
    /SMTP_SECURE/
  );
  assert.throws(
    () => validateEnv({ ...smtpConfiguration, SMTP_FROM: 'not-an-email' }),
    /SMTP_FROM/
  );
  assert.throws(
    () => validateEnv({ ...smtpConfiguration, SMTP_SECURE: 'false' }),
    /SMTP_SECURE must be true when SMTP_PORT is 465/
  );
});

test('SMTP environment — rejects a malformed hostname', () => {
  assert.throws(
    () => validateEnv({ ...smtpConfiguration, SMTP_HOST: 'mail host.invalid' }),
    /SMTP_HOST/
  );
});

test('SMTP environment — allows email configuration to remain absent for non-email deployments', () => {
  const parsed = validateEnv({
    NODE_ENV: 'test',
    DB_NAME: 'apex_trade_test',
    DB_USER: 'test_user',
  });

  assert.equal(parsed.SMTP_HOST, undefined);
  assert.equal(parsed.SMTP_SECURE, undefined);
});
