import {
  cleanText,
  createActionHtml,
  createEmailHtml,
  createExpiryHtml,
  getAction,
  getExpiryText,
} from './template.utils.js';

export function createVerificationEmail({ name = 'there', verificationUrl, verificationCode, expiresIn } = {}) {
  const action = getAction({
    url: verificationUrl,
    code: verificationCode,
    label: 'Verify email address',
  });
  const expiry = getExpiryText(expiresIn);
  const safeName = cleanText(name || 'there');
  const actionText = action.url ? `Verify your email address: ${action.url}` : '';
  const codeText = action.code ? `Your verification code is: ${action.code}` : '';
  const expiryText = expiry ? `This link or code expires ${expiry}.` : '';
  const html = createEmailHtml({
    title: 'Welcome to Apex Trade',
    name: safeName,
    content: '<p style="margin:0 0 16px;">Please verify your email address to help secure your Apex Trade account.</p>',
    actionHtml: createActionHtml({ ...action, label: 'Verify email address' }),
    footer: createExpiryHtml(expiry),
  });

  return {
    subject: 'Verify your Apex Trade email address',
    text: [
      'Welcome to Apex Trade.',
      `Hello ${safeName},`,
      'Please verify your email address to help secure your Apex Trade account.',
      actionText,
      codeText,
      expiryText,
    ].filter(Boolean).join('\n\n'),
    html,
  };
}
