import app from './app.js';
import env, { validateEnv } from './config/env.js';
import { testConnection, closeConnection } from './config/database.js';

let server = null;
let isShuttingDown = false;

/**
 * Initializes database connection and starts the HTTP server.
 */
export async function startServer() {
  try {
    // 1. Validate environment configuration
    validateEnv(process.env);

    // 2. Initialize database connection
    console.log('[Database] Connecting to MySQL...');
    await testConnection();
    console.log('[Database] MySQL connection established successfully.');

    // 3. Start HTTP server only after database is connected
    const port = env.PORT || 5000;
    server = app.listen(port, () => {
      console.log(`[Server] Apex Trade API running in ${env.NODE_ENV} mode on port ${port}`);
    });

    server.on('error', (err) => {
      console.error('[Server] HTTP server encountered an error:', err.message);
      process.exit(1);
    });

    return server;
  } catch (err) {
    const errorDetail = err.message || (err.parent?.code ? `${err.name} (${err.parent.code})` : err.name) || 'Unknown error';
    console.error(`[Startup Error] Server initialization failed: ${errorDetail}`);
    process.exit(1);
  }
}

/**
 * Gracefully shuts down the HTTP server and database connections.
 *
 * @param {string} signal
 */
export async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[Shutdown] Received ${signal}. Closing server and database connections cleanly...`);

  const forceExitTimer = setTimeout(() => {
    console.error('[Shutdown] Graceful shutdown timed out after 10s. Forcing exit.');
    process.exit(1);
  }, 10000);
  forceExitTimer.unref();

  if (server) {
    await new Promise((resolve) => server.close(resolve));
    console.log('[Shutdown] HTTP server closed.');
  }

  try {
    await closeConnection();
    console.log('[Shutdown] Database connection closed.');
  } catch (dbErr) {
    console.error('[Shutdown] Error while closing database pool:', dbErr.message);
  }

  console.log('[Shutdown] Graceful shutdown completed.');
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Auto-start when executed as the main script
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('server.js') ||
  process.argv[1].endsWith('server\\src\\server.js')
);

if (isMainModule) {
  startServer();
}

export default startServer;
