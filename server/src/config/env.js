import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

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

  // Reserved for future milestones (optional during Milestone 1)
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  ACCESS_TOKEN_EXPIRES: z.string().optional(),
  REFRESH_TOKEN_EXPIRES: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.preprocess((val) => (val !== undefined && val !== '' ? Number(val) : undefined), z.number().int().optional()),
  SMTP_SECURE: z.preprocess((val) => (val === 'true' || val === true ? true : val === 'false' || val === false ? false : undefined), z.boolean().optional()),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
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

