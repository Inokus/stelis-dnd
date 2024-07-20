import type { Database } from '@server/database';
import { usersRepository } from './usersRepository';
import { campaignsRepository } from './campaignsRepository';

export type RepositoryFactory = <T>(db: Database) => T;

const repositories = { usersRepository, campaignsRepository };

export type RepositoriesFactories = typeof repositories;
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>;
};
export type RepositoriesKeys = keyof Repositories;

export { repositories };
