import type { Database } from '@server/database';
import type { Items } from '@server/database/types';
import { type ItemPublic, itemKeysPublic } from '@server/entities/items';
import type { Insertable, Updateable } from 'kysely';

export function itemsRepository(db: Database) {
  return {
    async create(item: Insertable<Items>): Promise<ItemPublic> {
      return db
        .insertInto('items')
        .values(item)
        .returning(itemKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async getByIds(itemIds: number[]): Promise<ItemPublic[]> {
      return db
        .selectFrom('items')
        .select(itemKeysPublic)
        .where('id', 'in', itemIds)
        .orderBy('name')
        .execute();
    },

    async getAvailable(restrictedItemsIds: number[]): Promise<ItemPublic[]> {
      if (restrictedItemsIds.length > 0) {
        return db
          .selectFrom('items')
          .select(itemKeysPublic)
          .where('id', 'not in', restrictedItemsIds)
          .orderBy('name')
          .execute();
      }
      return db
        .selectFrom('items')
        .select(itemKeysPublic)
        .orderBy('name')
        .execute();
    },

    async update(
      id: number,
      updateData: Updateable<Items>
    ): Promise<ItemPublic> {
      return db
        .updateTable('items')
        .set(updateData)
        .where('id', '=', id)
        .returning(itemKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async remove(id: number): Promise<ItemPublic> {
      return db
        .deleteFrom('items')
        .where('id', '=', id)
        .returning(itemKeysPublic)
        .executeTakeFirstOrThrow();
    },
  };
}

export type ItemsRepository = ReturnType<typeof itemsRepository>;
