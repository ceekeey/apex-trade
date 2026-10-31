import {
  cleanText,
  createActionHtml,
  createEmailHtml,
  createExpiryHtml,
  getAction,
  getExpiryText,
} from './template.utils.js';

export function createPasswordResetEmail({ name = 'there', resetUrl, resetCode, expiresIn } = {}) {
  const action = getAction({
    url: resetUrl,
    code: resetCode,
    label: 'Reset password',
  });
  const expiry = getExpiryText(expiresIn);
  const safeName = cleanText(name || 'there');
  const actionText = action.url ? `Reset your password: ${action.url}` : '';
  const codeText = action.code ? `Your password reset code is: ${action.code}` : '';
  const expiryText = expiry ? `This link or code expires ${expiry}.` : '';
  const html = createEmailHtml({
    title: 'Password reset request',
    name: safeName,
    content: '<p style="margin:0 0 16px;">We received a request to reset the password for your Apex Trade account.</p>',
    actionHtml: createActionHtml({ ...action, label: 'Reset password' }),
    footer: `${createExpiryHtml(expiry)}<p style="margin:16px 0 0;color:#514b5d;">If you did not request a password reset, you can ignore this email. Your password will not change.</p>`,
  });

  return {
    subject: 'Reset your Apex Trade password',
    text: [
      `Hello ${safeName},`,
      'We received a request to reset the password for your Apex Trade account.',
      actionText,
      codeText,
      expiryText,
      'If you did not request a password reset, you can ignore this email. Your password will not change.',
    ].filter(Boolean).join('\n\n'),
    html,
  };
}
