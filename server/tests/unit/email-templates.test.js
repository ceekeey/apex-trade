import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPasswordResetEmail,
  createVerificationEmail,
  createWelcomeEmail,
} from '../../src/services/email/templates/index.js';

test('Email templates — verification supports links and codes and describes supplied expiry', () => {
  const linkMessage = createVerificationEmail({
    name: 'Apex user',
    verificationUrl: 'https://apextrade.example/verify?token=sample',
    expiresIn: 'in 30 minutes',
  });
  const codeMessage = createVerificationEmail({
    verificationCode: '123456',
  });

  assert.match(linkMessage.subject, /Verify your Apex Trade email address/);
  assert.match(linkMessage.text, /expires in 30 minutes/);
  assert.match(linkMessage.html, /https:\/\/apextrade\.example\/verify\?token=sample/);
  assert.match(codeMessage.text, /123456/);
  assert.match(codeMessage.html, /123456/);
  assert.match(linkMessage.html, /Apex Trade/);
});

test('Email templates — password reset includes the request warning and supplied expiry', () => {
  const message = createPasswordResetEmail({
    resetCode: 'reset-123',
    expiresIn: new Date('2030-01-01T00:00:00.000Z'),
  });

  assert.match(message.text, /We received a request to reset the password/);
  assert.match(message.text, /If you did not request a password reset/);
  assert.match(message.text, /2030-01-01T00:00:00\.000Z/);
  assert.match(message.html, /Your password will not change/);
  assert.match(message.html, /reset-123/);
});

test('Email templates — welcome message introduces the journal without performance promises', () => {
  const message = createWelcomeEmail({ name: 'Apex user' });

  assert.match(message.text, /trading journal and performance-review workspace/);
  assert.match(message.html, /Record trades, reflect on decisions/);
  assert.match(message.text, /does not promise or guarantee trading profits/);
  assert.match(message.html, /does not promise or guarantee trading profits/);
});

test('Email templates — escapes dynamic HTML values and rejects unsafe action URLs', () => {
  const message = createVerificationEmail({
    name: '<img src=x onerror=alert(1)>',
    verificationCode: '<script>alert(1)</script>',
    expiresIn: '<b>never</b>',
  });

  assert.equal(message.html.includes('<img src=x'), false);
  assert.equal(message.html.includes('<script>'), false);
  assert.match(message.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(message.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(message.html, /&lt;b&gt;never&lt;\/b&gt;/);
  assert.throws(
    () => createVerificationEmail({ verificationUrl: 'javascript:alert(1)' }),
    /HTTP or HTTPS URL/
  );
});

test('Email templates — require a caller-supplied verification or reset action', () => {
  assert.throws(() => createVerificationEmail(), /URL or code is required/);
  assert.throws(() => createPasswordResetEmail(), /URL or code is required/);
});
