/**
 * Apex Trade Express Application Compatibility Entry Point.
 * Re-exports the modular application factory and default instance from server/src/app.js.
 */
import app, { createApp } from './src/app.js';

export { createApp, app };
export default app;

