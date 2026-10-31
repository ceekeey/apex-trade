import fs from 'node:fs';
import path from 'node:path';
import { domainToASCII } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

function isHostname(value) {
  const hostname = domainToASCII(value.trim());
  if (!hostname || hostname.length > 253) {
    return false;
  }

  return hostname.split('.').every((label) => (
    label.length > 0 &&
    label.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
  ));
}

function isValidSender(value) {
  const address = value.trim();
  const directAddress = z.email().safeParse(address);

  if (directAddress.success) {
    return true;
  }

  const senderMatch = /^(?:"[^"\r\n]+"|[^<>\r\n]+)\s*<([^<>\s]+)>$/.exec(address);
  return Boolean(senderMatch && z.email().safeParse(senderMatch[1]).success);
}

export const emailSenderSchema = z
  .string()
  .trim()
  .min(1, 'SMTP_FROM is required')
  .refine(isValidSender, 'SMTP_FROM must be a valid email address or sender format');

/**
 * Environment Loading Precedence:
 * 1. Pre-existing process.env variables (e.g. system environment or test runner) take highest precedence.
 * 2. .env is loaded as the baseline configuration file.
 * 3. .env.local (if present) is loaded without overwriting existing process.env keys.
 */
const rootDir = process.cwd();
const envPath = path.resolve(rootDir, '.env');
const envLocalPath = path.resolve(rootDir, '.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .preprocess((val) => (val !== undefined && val !== '' ? Number(val) : 5000), z.number().int().min(1).max(65535))
    .default(5000),
  DB_HOST: z.string().min(1, 'DB_HOST is required').default('localhost'),
  DB_PORT: z
    .preprocess((val) => (val !== undefined && val !== '' ? Number(val) : 3306), z.number().int().min(1).max(65535))
    .default(3306),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().default(''),
  CLIENT_URL: z.string().min(1, 'CLIENT_URL is required').default('http://localhost:5173'),

  // SMTP remains optional until configured; partial SMTP configuration is rejected.
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  ACCESS_TOKEN_EXPIRES: z.string().optional(),
  REFRESH_TOKEN_EXPIRES: z.string().optional(),
  SMTP_HOST: z
    .string()
    .trim()
    .min(1, 'SMTP_HOST must be a non-empty hostname')
    .refine(isHostname, 'SMTP_HOST must be a valid hostname')
    .optional(),
  SMTP_PORT: z.preprocess(
    (val) => (val !== undefined && val !== '' ? Number(val) : undefined),
    z.number().int().min(1).max(65535).optional()
  ),
  SMTP_SECURE: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return val;
  }, z.boolean().optional()),
  SMTP_USER: z.string().trim().min(1, 'SMTP_USER must be non-empty').optional(),
  SMTP_PASS: z
    .string()
    .refine((value) => value.trim().length > 0, 'SMTP_PASS must be non-empty')
    .optional(),
  SMTP_FROM: emailSenderSchema.optional(),
}).superRefine((config, context) => {
  const smtpFields = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const emailDeliveryEnabled = smtpFields.some((field) => config[field] !== undefined);

  if (!emailDeliveryEnabled) {
    return;
  }

  for (const field of smtpFields) {
    if (config[field] === undefined) {
      context.addIssue({
        code: 'custom',
        path: [field],
        message: `${field} is required when email delivery is configured`,
      });
    }
  }

  if (config.SMTP_PORT === 465 && config.SMTP_SECURE !== true) {
    context.addIssue({
      code: 'custom',
      path: ['SMTP_SECURE'],
      message: 'SMTP_SECURE must be true when SMTP_PORT is 465',
    });
  }
});

/**
 * Validates an environment object against the schema.
 * Produces clear error messages without exposing secret values.
 *
 * @param {Record<string, unknown>} rawEnv
 * @returns {z.infer<typeof envSchema>}
 */
export function validateEnv(rawEnv = process.env) {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const issueMessages = result.error.issues.map((issue) => {
      const field = issue.path.join('.') || 'configuration';
      return `${field}: ${issue.message}`;
    });

    const errorMsg = `Environment validation failed:\n  - ${issueMessages.join('\n  - ')}`;
    throw new Error(errorMsg);
  }

  return result.data;
}

// In test environment, allow lazy evaluation or fallback if process.env is mocked
let cachedEnv;
export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = validateEnv(process.env);
  }
  return cachedEnv;
}

export const env = getEnv();
export default env;
