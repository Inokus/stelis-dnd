import type { Database } from '@server/database';
import type { Items } from '@server/database/types';
import { type ItemPublic, itemKeysPublic } from '@server/entities/items';
import type { Insertable } from 'kysely';

export function itemsRepository(db: Database) {
  return {
    async create(item: Insertable<Items>): Promise<ItemPublic> {
      return db
        .insertInto('items')
        .values(item)
        .returning(itemKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async getAll(): Promise<ItemPublic[]> {
      return db
        .selectFrom('items')
        .select(itemKeysPublic)
        .orderBy('name')
        .execute();
    },
  };
}

export type ItemsRepository = ReturnType<typeof itemsRepository>;
