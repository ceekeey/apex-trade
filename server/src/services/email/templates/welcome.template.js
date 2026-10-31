import { cleanText, createEmailHtml } from './template.utils.js';

export function createWelcomeEmail({ name = 'there' } = {}) {
  const safeName = cleanText(name || 'there');

  return {
    subject: 'Welcome to Apex Trade',
    text: [
      `Hello ${safeName},`,
      'Welcome to Apex Trade, your trading journal and performance-review workspace.',
      'Use your journal to record trades, reflect on decisions and review your activity over time.',
      'Apex Trade does not promise or guarantee trading profits or performance.',
    ].join('\n\n'),
    html: createEmailHtml({
      title: 'Welcome to Apex Trade',
      name: safeName,
      content: [
        '<p style="margin:0 0 16px;">Apex Trade is your trading journal and performance-review workspace.</p>',
        '<p style="margin:0 0 16px;">Record trades, reflect on decisions and review your activity over time.</p>',
        '<p style="margin:0;color:#514b5d;">Apex Trade does not promise or guarantee trading profits or performance.</p>',
      ].join(''),
    }),
  };
}
