import type { Database } from '@server/database';
import type { CharactersItems } from '@server/database/types';
import {
  type CharacterItemPublic,
  characterItemKeysPublic,
} from '@server/entities/charactersItems';
import type { Insertable } from 'kysely';

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

    async getAll(characterId: number): Promise<CharacterItemPublic[]> {
      return db
        .selectFrom('charactersItems')
        .select(characterItemKeysPublic)
        .where('characterId', '=', characterId)
        .execute();
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
