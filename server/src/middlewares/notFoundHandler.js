/**
 * 404 Not Found Middleware.
 * Catches any unhandled route and returns a standardized JSON response.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    status: 'error',
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

export default notFoundHandler;

