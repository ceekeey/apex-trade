export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function cleanText(value) {
  return String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
}

export function getExpiryText(expiresIn) {
  if (expiresIn === undefined || expiresIn === null || expiresIn === '') {
    return '';
  }

  if (expiresIn instanceof Date) {
    if (Number.isNaN(expiresIn.getTime())) {
      throw new TypeError('Expiry must be a valid date or non-empty string');
    }
    return expiresIn.toISOString();
  }

  if (typeof expiresIn !== 'string' || !expiresIn.trim()) {
    throw new TypeError('Expiry must be a valid date or non-empty string');
  }

  return cleanText(expiresIn);
}

export function getAction({ url, code, label }) {
  let safeUrl;
  if (url !== undefined && url !== null) {
    if (typeof url !== 'string' || !url.trim()) {
      throw new TypeError(`${label} URL must be a non-empty HTTP or HTTPS URL`);
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new TypeError(`${label} URL must be a non-empty HTTP or HTTPS URL`);
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) {
      throw new TypeError(`${label} URL must be a non-empty HTTP or HTTPS URL`);
    }
    safeUrl = parsedUrl.toString();
  }

  let safeCode;
  if (code !== undefined && code !== null) {
    if (typeof code !== 'string' || !code.trim()) {
      throw new TypeError(`${label} code must be a non-empty string`);
    }
    safeCode = cleanText(code);
  }

  if (!safeUrl && !safeCode) {
    throw new TypeError(`A ${label.toLowerCase()} URL or code is required`);
  }

  return { url: safeUrl, code: safeCode };
}

export function createEmailHtml({ title, name, content, actionHtml = '', footer = '' }) {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f5f3fa;color:#211d2b;font-family:Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border-radius:12px;padding:32px;border-top:4px solid #863bff;">
        <p style="margin:0 0 24px;color:#863bff;font-size:18px;font-weight:700;">Apex Trade</p>
        <h1 style="margin:0 0 16px;font-size:24px;">${escapeHtml(title)}</h1>
        <p style="margin:0 0 16px;">Hello ${escapeHtml(name)},</p>
        ${content}
        ${actionHtml}
        ${footer}
      </div>
    </div>
  </body>
</html>`;
}

export function createActionHtml({ url, code, label }) {
  const link = url
    ? `<p style="margin:24px 0;"><a href="${escapeHtml(url)}" style="display:inline-block;background:#863bff;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;">${escapeHtml(label)}</a></p>`
    : '';
  const codeBlock = code
    ? `<p style="margin:16px 0;">Your code: <strong>${escapeHtml(code)}</strong></p>`
    : '';

  return `${link}${codeBlock}`;
}

export function createExpiryHtml(expiresIn) {
  return expiresIn
    ? `<p style="margin:16px 0;color:#514b5d;">This link or code expires ${escapeHtml(expiresIn)}.</p>`
    : '';
}
