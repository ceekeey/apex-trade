import env from './env.js';

/**
 * Creates CORS configuration options based on CLIENT_URL.
 *
 * @param {string} [allowedOrigin=env.CLIENT_URL]
 * @returns {import('cors').CorsOptions}
 */
export function createCorsOptions(allowedOrigin = env.CLIENT_URL) {
  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, same-origin)
      if (!origin) {
        return callback(null, true);
      }

      if (origin === allowedOrigin) {
        return callback(null, true);
      }

      const corsError = new Error('Not allowed by CORS');
      corsError.status = 403;
      return callback(corsError);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400,
  };
}

export const corsOptions = createCorsOptions();
export default corsOptions;

