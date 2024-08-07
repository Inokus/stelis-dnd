import config from '@server/config';
import { createDatabase } from '@server/database';

export const createTestDatabase = () => createDatabase(config.testDatabase);
