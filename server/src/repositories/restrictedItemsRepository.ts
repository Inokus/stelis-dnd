import type { Database } from '@server/database';
import type { RestrictedItems } from '@server/database/types';
import {
  type RestrictedItemPublic,
  restrictedItemKeysPublic,
} from '@server/entities/restrictedItems';
import type { Insertable } from 'kysely';

export function restrictedItemsRepository(db: Database) {
  return {
    async create(
      restrictedItem: Insertable<RestrictedItems>
    ): Promise<RestrictedItemPublic> {
      return db
        .insertInto('restrictedItems')
        .values(restrictedItem)
        .returning(restrictedItemKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async getAll(campaignId: number): Promise<RestrictedItemPublic[]> {
      return db
        .selectFrom('restrictedItems')
        .select(restrictedItemKeysPublic)
        .where('campaignId', '!=', campaignId)
        .execute();
    },

    async remove(
      restrictedItem: Insertable<RestrictedItems>
    ): Promise<RestrictedItemPublic> {
      return db
        .deleteFrom('restrictedItems')
        .where('campaignId', '=', restrictedItem.campaignId)
        .where('itemId', '=', restrictedItem.itemId)
        .returning(restrictedItemKeysPublic)
        .executeTakeFirstOrThrow();
    },
  };
}

export type RestrictedItemsRepository = ReturnType<
  typeof restrictedItemsRepository
>;
