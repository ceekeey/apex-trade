import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createCorsOptions } from './config/cors.js';
import { createHealthRouter } from './routes/health.routes.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';

/**
 * Express Application Factory.
 * Configures middleware pipeline, security headers, routing, and error handling.
 *
 * @param {object} [options]
 * @param {Function} [options.dbChecker]
 * @param {import('cors').CorsOptions} [options.corsOptions]
 * @param {string} [options.clientUrl]
 * @returns {import('express').Express}
 */
export function createApp(options = {}) {
  const app = express();

  // 1. Security Headers
  app.use(helmet());

  // 2. Explicit CORS Origin allowlist
  const corsOpts = options.corsOptions || createCorsOptions(options.clientUrl);
  app.use(cors(corsOpts));

  // 3. Request Parsers with reasonable limits
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // 4. Cookie Parser
  app.use(cookieParser());

  // 5. Health & Readiness Endpoints
  const healthRouter = options.healthRouter || createHealthRouter(options.dbChecker);
  app.use('/', healthRouter);
  app.use('/api', healthRouter);

  // 6. Not-Found Handler (404)
  app.use(notFoundHandler);

  // 7. Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;

