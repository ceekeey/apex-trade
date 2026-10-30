import { Sequelize } from 'sequelize';
import env from './env.js';

/**
 * Creates and configures the Sequelize instance.
 *
 * @param {object} [customConfig]
 * @returns {Sequelize}
 */
export function createSequelizeInstance(customConfig = {}) {
  const isProduction = env.NODE_ENV === 'production';

  return new Sequelize(
    customConfig.database || env.DB_NAME,
    customConfig.username || env.DB_USER,
    customConfig.password !== undefined ? customConfig.password : env.DB_PASSWORD,
    {
      host: customConfig.host || env.DB_HOST,
      port: customConfig.port || env.DB_PORT,
      dialect: 'mysql',
      logging: customConfig.logging !== undefined ? customConfig.logging : false,
      pool: {
        max: customConfig.pool?.max || (isProduction ? 20 : 10),
        min: customConfig.pool?.min || 0,
        acquire: customConfig.pool?.acquire || 30000,
        idle: customConfig.pool?.idle || 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
      },
      ...customConfig,
    }
  );
}

export const sequelize = createSequelizeInstance();

/**
 * Verifies that MySQL is reachable.
 *
 * @param {Sequelize} [instance]
 * @returns {Promise<boolean>}
 */
export async function testConnection(instance = sequelize) {
  await instance.authenticate();
  return true;
}

/**
 * Closes the Sequelize connection pool cleanly during shutdown.
 *
 * @param {Sequelize} [instance]
 * @returns {Promise<void>}
 */
export async function closeConnection(instance = sequelize) {
  await instance.close();
}

export default sequelize;

