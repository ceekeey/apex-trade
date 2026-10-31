import nodemailer from 'nodemailer';
import { z } from 'zod';
import env, { emailSenderSchema } from '../config/env.js';

const emailMessageSchema = z.object({
  to: z.email(),
  subject: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), 'Subject cannot contain control characters'),
  text: z.string().optional(),
  html: z.string().optional(),
  from: emailSenderSchema.optional(),
}).refine(
  (message) => [message.text, message.html].some((body) => typeof body === 'string' && body.trim().length > 0),
  'At least one non-empty text or HTML body is required'
);

const SMTP_FIELDS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
const CONNECTION_CODES = new Set([
  'ECONNECTION',
  'ECONNREFUSED',
  'ECONNRESET',
  'EHOSTUNREACH',
  'EAI_AGAIN',
  'ENOTFOUND',
  'ESOCKET',
  'ETIMEDOUT',
  'EPIPE',
]);
const AUTH_RESPONSE_CODES = new Set([530, 534, 535, 538]);

export class EmailServiceError extends Error {
  constructor(code, message, diagnostics = {}) {
    super(message);
    this.name = 'EmailServiceError';
    this.code = code;
    this.category = code.replace(/^EMAIL_/, '').replace(/_[A-Z]+$/, '').toLowerCase();
    this.diagnostics = diagnostics;
  }
}

function getSafeDiagnostics(error) {
  if (!error || typeof error !== 'object') {
    return {};
  }

  const diagnostics = {};
  if (typeof error.code === 'string' && /^[A-Z][A-Z0-9_]{0,31}$/.test(error.code)) {
    diagnostics.transportCode = error.code;
  }
  if (Number.isInteger(error.responseCode)) {
    diagnostics.smtpResponseCode = error.responseCode;
  }
  if (typeof error.command === 'string') {
    const command = error.command.trim().split(/\s+/, 1)[0].toUpperCase();
    if (/^[A-Z]{1,12}$/.test(command)) {
      diagnostics.command = command;
    }
  }
  return diagnostics;
}

function classifyTransportError(error, operation) {
  const diagnostics = getSafeDiagnostics(error);
  const responseCode = diagnostics.smtpResponseCode;
  const transportCode = diagnostics.transportCode;

  if (
    transportCode === 'EAUTH' ||
    AUTH_RESPONSE_CODES.has(responseCode) ||
    diagnostics.command === 'AUTH'
  ) {
    return new EmailServiceError(
      'EMAIL_AUTHENTICATION_FAILED',
      'Email service authentication failed',
      diagnostics
    );
  }

  if (
    operation === 'verify' ||
    diagnostics.command === 'CONN' ||
    CONNECTION_CODES.has(transportCode)
  ) {
    return new EmailServiceError(
      'EMAIL_CONNECTION_FAILED',
      'Could not connect to the email service',
      diagnostics
    );
  }

  return new EmailServiceError(
    'EMAIL_DELIVERY_FAILED',
    'Email could not be sent',
    diagnostics
  );
}

function hasSmtpConfiguration(config) {
  return SMTP_FIELDS.every((field) => config[field] !== undefined);
}

function hasAnySmtpConfiguration(config) {
  return SMTP_FIELDS.some((field) => config[field] !== undefined);
}

/**
 * Creates a reusable email service. Production uses the module-level instance below;
 * the factory accepts a transport creator so SMTP operations can be mocked in tests.
 *
 * @param {{config?: object, createTransport?: Function}} options
 */
export function createEmailService({ config = env, createTransport = nodemailer.createTransport } = {}) {
  let transporter;

  function getTransporter() {
    if (!hasSmtpConfiguration(config)) {
      const code = hasAnySmtpConfiguration(config)
        ? 'EMAIL_CONFIGURATION_INVALID'
        : 'EMAIL_CONFIGURATION_MISSING';
      throw new EmailServiceError(code, 'Email service is not configured');
    }

    if (!transporter) {
      try {
        transporter = createTransport({
          host: config.SMTP_HOST,
          port: config.SMTP_PORT,
          secure: config.SMTP_SECURE,
          auth: {
            user: config.SMTP_USER,
            pass: config.SMTP_PASS,
          },
        });
      } catch (error) {
        throw new EmailServiceError(
          'EMAIL_CONFIGURATION_INVALID',
          'Email transport configuration is invalid',
          getSafeDiagnostics(error)
        );
      }
    }

    return transporter;
  }

  return {
    async verify() {
      const transport = getTransporter();
      try {
        const verified = await transport.verify();
        if (verified !== true) {
          throw new EmailServiceError(
            'EMAIL_CONNECTION_FAILED',
            'Email service verification did not succeed'
          );
        }
        return true;
      } catch (error) {
        if (error instanceof EmailServiceError) {
          throw error;
        }
        throw classifyTransportError(error, 'verify');
      }
    },

    async sendEmail(message) {
      const result = emailMessageSchema.safeParse(message);
      if (!result.success) {
        const fields = [...new Set(result.error.issues.map((issue) => issue.path.join('.')).filter(Boolean))];
        throw new EmailServiceError(
          'EMAIL_MESSAGE_INVALID',
          'Email message is invalid',
          { fields }
        );
      }

      const transport = getTransporter();
      const { to, subject, text, html, from } = result.data;
      let info;
      try {
        info = await transport.sendMail({
          from: from || config.SMTP_FROM,
          to,
          subject,
          ...(text !== undefined ? { text } : {}),
          ...(html !== undefined ? { html } : {}),
        });
      } catch (error) {
        throw classifyTransportError(error, 'send');
      }

      if (!info || !Array.isArray(info.accepted) || info.accepted.length === 0) {
        throw new EmailServiceError(
          'EMAIL_DELIVERY_FAILED',
          'Email was not accepted by the email service'
        );
      }

      return {
        acceptedByRelay: true,
        messageId: typeof info.messageId === 'string' ? info.messageId : undefined,
      };
    },
  };
}

const emailService = createEmailService();

export const verifyEmailTransporter = () => emailService.verify();
export const sendEmail = (message) => emailService.sendEmail(message);

export default emailService;
