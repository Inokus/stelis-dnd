import type { Database } from '@server/database';
import type { CharactersItems } from '@server/database/types';
import {
  type CharacterItemPublic,
  characterItemKeysPublic,
} from '@server/entities/charactersItems';
import {
  type ItemWithQuantityPublic,
  itemKeysPublic,
} from '@server/entities/items';
import type { Insertable, Updateable } from 'kysely';

export function charactersItemsRepository(db: Database) {
  return {
    async create(
      characterItem: Insertable<CharactersItems>
    ): Promise<CharacterItemPublic> {
      return db
        .insertInto('charactersItems')
        .values(characterItem)
        .returning(characterItemKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async getAll(characterId: number): Promise<ItemWithQuantityPublic[]> {
      return db
        .selectFrom('charactersItems as c')
        .innerJoin('items as i', 'i.id', 'c.itemId')
        .select([
          ...itemKeysPublic.map((key) => `i.${key}`),
          'c.quantity',
        ] as (keyof ItemWithQuantityPublic)[])
        .where('characterId', '=', characterId)
        .orderBy('i.name')
        .execute();
    },

    async update(
      characterId: number,
      itemId: number,
      updateData: Updateable<CharactersItems>
    ): Promise<CharacterItemPublic> {
      return db
        .updateTable('charactersItems')
        .set(updateData)
        .where('characterId', '=', characterId)
        .where('itemId', '=', itemId)
        .returning(characterItemKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async remove(
      characterId: number,
      itemId: number
    ): Promise<CharacterItemPublic> {
      return db
        .deleteFrom('charactersItems')
        .where('characterId', '=', characterId)
        .where('itemId', '=', itemId)
        .returning(characterItemKeysPublic)
        .executeTakeFirstOrThrow();
    },
  };
}

export type CharactersItemsRepisotry = ReturnType<
  typeof charactersItemsRepository
>;
