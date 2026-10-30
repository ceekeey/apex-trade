import { Router } from 'express';
import { testConnection } from '../config/database.js';

/**
 * Creates the health and readiness router.
 *
 * @param {Function} [dbChecker=testConnection]
 * @returns {Router}
 */
export function createHealthRouter(dbChecker = testConnection) {
  const router = Router();

  /**
   * GET /health
   * Simple process liveness check.
   */
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  });

  /**
   * GET /ready
   * Readiness check verifying MySQL database connectivity.
   * Never exposes credentials, connection strings, or internal SQL errors.
   */
  router.get('/ready', async (req, res) => {
    try {
      await dbChecker();
      return res.status(200).json({
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch {
      return res.status(503).json({
        status: 'unavailable',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}

export const healthRouter = createHealthRouter();
export default healthRouter;

