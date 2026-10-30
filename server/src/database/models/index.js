import { sequelize } from '../../config/database.js';

/**
 * Apex Trade Database Models Registry.
 *
 * Models will be registered in future milestones (Milestones 3, 5, 6, 7).
 * Destructive automatic syncing (force/alter) is strictly prohibited.
 */
const db = {
  sequelize,
};

export { sequelize };
export default db;

