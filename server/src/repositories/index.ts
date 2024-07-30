import type { Database } from '@server/database';
import { usersRepository } from './usersRepository';
import { campaignsRepository } from './campaignsRepository';
import { charactersRepository } from './charactersRepository';
import { itemsRepository } from './itemsRepository';
import { restrictedItemsRepository } from './restrictedItemsRepository';
import { charactersItemsRepository } from './charactersItemsRepository';
import { downtimesRepository } from './downtimesRepository';
import { transactionsRepository } from './transactionsRepository';

export type RepositoryFactory = <T>(db: Database) => T;

const repositories = {
  usersRepository,
  campaignsRepository,
  charactersRepository,
  itemsRepository,
  restrictedItemsRepository,
  charactersItemsRepository,
  downtimesRepository,
  transactionsRepository,
};

export type RepositoriesFactories = typeof repositories;
export type Repositories = {
  [K in keyof RepositoriesFactories]: ReturnType<RepositoriesFactories[K]>;
};
export type RepositoriesKeys = keyof Repositories;

export { repositories };
