import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnv } from '../../src/config/env.js';
import { createEmailService, EmailServiceError } from '../../src/services/email.service.js';

function getTestConfig() {
  return validateEnv({
    NODE_ENV: 'test',
    DB_NAME: 'apex_trade_test',
    DB_USER: 'test_user',
    SMTP_HOST: 'mail.apextrade.name.ng',
    SMTP_PORT: '465',
    SMTP_SECURE: 'true',
    SMTP_USER: 'support@apextrade.name.ng',
    SMTP_PASS: 'unit-test-password',
    SMTP_FROM: 'Apex Trade <support@apextrade.name.ng>',
  });
}

function createMockTransport(overrides = {}) {
  return {
    verify: async () => true,
    sendMail: async () => ({
      accepted: ['recipient@example.com'],
      rejected: [],
      messageId: 'mock-message-id',
    }),
    ...overrides,
  };
}

test('Email service — creates and reuses a secure transporter from validated configuration', async () => {
  const config = getTestConfig();
  const transportOptions = [];
  let transportCreations = 0;
  const service = createEmailService({
    config,
    createTransport(options) {
      transportCreations += 1;
      transportOptions.push(options);
      return createMockTransport();
    },
  });

  await service.verify();
  await service.sendEmail({
    to: 'recipient@example.com',
    subject: 'Test',
    text: 'Test message',
  });

  assert.equal(transportCreations, 1);
  assert.equal(transportOptions[0].host, 'mail.apextrade.name.ng');
  assert.equal(transportOptions[0].port, 465);
  assert.equal(transportOptions[0].secure, true);
  assert.equal(transportOptions[0].auth.user, config.SMTP_USER);
  assert.equal(transportOptions[0].auth.pass.length > 0, true);
});

test('Email service — reports transporter verification success', async () => {
  const service = createEmailService({
    config: getTestConfig(),
    createTransport: () => createMockTransport({ verify: async () => true }),
  });

  assert.equal(await service.verify(), true);
});

test('Email service — safely classifies transporter verification failures', async () => {
  const service = createEmailService({
    config: getTestConfig(),
    createTransport: () => createMockTransport({
      verify: async () => {
        const error = new Error('Remote authentication response contained sensitive data');
        error.code = 'EAUTH';
        error.responseCode = 535;
        error.command = 'AUTH PLAIN';
        throw error;
      },
    }),
  });

  await assert.rejects(service.verify(), (error) => {
    assert.ok(error instanceof EmailServiceError);
    assert.equal(error.code, 'EMAIL_AUTHENTICATION_FAILED');
    assert.equal(error.message, 'Email service authentication failed');
    assert.equal(error.diagnostics.smtpResponseCode, 535);
    assert.equal(error.diagnostics.command, 'AUTH');
    assert.equal(error.message.includes('sensitive data'), false);
    return true;
  });
});

test('Email service — sends mocked email using the configured default sender', async () => {
  const config = getTestConfig();
  let sentMessage;
  const service = createEmailService({
    config,
    createTransport: () => createMockTransport({
      sendMail: async (message) => {
        sentMessage = message;
        return {
          accepted: ['recipient@example.com'],
          rejected: [],
          messageId: 'mock-message-id',
        };
      },
    }),
  });

  const result = await service.sendEmail({
    to: 'recipient@example.com',
    subject: 'Apex Trade notice',
    text: 'Plain text body',
    html: '<p>HTML body</p>',
  });

  assert.equal(sentMessage.from, config.SMTP_FROM);
  assert.equal(sentMessage.to, 'recipient@example.com');
  assert.equal(sentMessage.text, 'Plain text body');
  assert.equal(sentMessage.html, '<p>HTML body</p>');
  assert.equal(result.acceptedByRelay, true);
  assert.equal(result.messageId, 'mock-message-id');
});

test('Email service — rejects invalid and unaccepted messages without success-shaped results', async () => {
  const service = createEmailService({
    config: getTestConfig(),
    createTransport: () => createMockTransport({
      sendMail: async () => ({ accepted: [], rejected: ['recipient@example.com'] }),
    }),
  });

  await assert.rejects(
    service.sendEmail({ to: 'recipient@example.com', subject: 'Missing body' }),
    { code: 'EMAIL_MESSAGE_INVALID' }
  );
  await assert.rejects(
    service.sendEmail({
      to: 'recipient@example.com',
      subject: 'Invalid\nsubject',
      text: 'Body',
    }),
    { code: 'EMAIL_MESSAGE_INVALID' }
  );
  await assert.rejects(
    service.sendEmail({
      to: 'recipient@example.com',
      subject: 'Rejected',
      text: 'This will not be accepted',
    }),
    { code: 'EMAIL_DELIVERY_FAILED' }
  );
});

test('Email service — sanitizes authentication and delivery errors without exposing credentials or tokens', async () => {
  const config = getTestConfig();
  const token = 'unit-test-reset-token';
  const service = createEmailService({
    config,
    createTransport: () => createMockTransport({
      sendMail: async () => {
        const error = new Error(`Sensitive server response ${config.SMTP_PASS} ${token}`);
        error.code = 'EAUTH';
        error.response = `Sensitive response ${config.SMTP_PASS} ${token}`;
        error.responseCode = 535;
        error.command = `AUTH PLAIN ${config.SMTP_PASS}`;
        throw error;
      },
    }),
  });

  await assert.rejects(
    service.sendEmail({
      to: 'recipient@example.com',
      subject: 'Reset',
      text: `Token ${token}`,
    }),
    (error) => {
      const serializedError = JSON.stringify(error);
      assert.equal(error.code, 'EMAIL_AUTHENTICATION_FAILED');
      assert.equal(error.message.includes(config.SMTP_PASS), false);
      assert.equal(error.message.includes(token), false);
      assert.equal(serializedError.includes(config.SMTP_PASS), false);
      assert.equal(serializedError.includes(token), false);
      return true;
    }
  );
});

test('Email service — reports missing configuration instead of silently skipping delivery', async () => {
  const service = createEmailService({
    config: { SMTP_HOST: undefined },
    createTransport: () => {
      throw new Error('Transport must not be constructed');
    },
  });

  await assert.rejects(
    service.sendEmail({
      to: 'recipient@example.com',
      subject: 'Test',
      text: 'Test',
    }),
    { code: 'EMAIL_CONFIGURATION_MISSING' }
  );
});
