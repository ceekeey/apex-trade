import env from '../config/env.js';

/**
 * Centralized Error Handling Middleware.
 * Standardizes API error responses and protects internal diagnostics in production.
 *
 * @param {any} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, req, res, next) {
  // If headers have already been sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // 1. Handle Malformed JSON payload from express.json()
  if (
    (err instanceof SyntaxError && err.status === 400 && 'body' in err) ||
    err.type === 'entity.parse.failed'
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'Malformed JSON payload',
    });
  }

  // 2. Handle CORS origin rejection
  if (err.message === 'Not allowed by CORS' || err.status === 403) {
    return res.status(403).json({
      status: 'error',
      message: 'Not allowed by CORS',
    });
  }

  // Determine status code
  const statusCode = typeof err.status === 'number' && err.status >= 400 && err.status < 600
    ? err.status
    : typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : 500;

  const isProduction = env.NODE_ENV === 'production';
  const isTest = env.NODE_ENV === 'test';

  // Safe diagnostic logging (never log request credentials or auth headers)
  if (!isTest) {
    const errorType = err.name || 'Error';
    console.error(`[API Error] ${req.method} ${req.originalUrl} - ${statusCode} ${errorType}: ${err.message}`);
    if (statusCode === 500 && !isProduction) {
      console.error(err.stack);
    }
  }

  const response = {
    status: 'error',
    message: statusCode === 500 && isProduction
      ? 'Internal server error'
      : err.message || 'Internal server error',
  };

  if (!isProduction && statusCode === 500 && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
}

export default errorHandler;

