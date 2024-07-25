import type { Database } from '@server/database';
import type { Characters } from '@server/database/types';
import {
  type CharacterPublic,
  characterKeysPublic,
} from '@server/entities/characters';
import type { Insertable } from 'kysely';

export function charactersRepository(db: Database) {
  return {
    async create(character: Insertable<Characters>): Promise<CharacterPublic> {
      return db
        .insertInto('characters')
        .values(character)
        .returning(characterKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async getAvailable(
      userId: number,
      campaignId: number
    ): Promise<CharacterPublic[]> {
      return db
        .selectFrom('characters')
        .select(characterKeysPublic)
        .where('userId', '=', userId)
        .where('campaignId', '=', campaignId)
        .orderBy('name')
        .execute();
    },

    async getAll(campaignId: number): Promise<CharacterPublic[]> {
      return db
        .selectFrom('characters')
        .select(characterKeysPublic)
        .where('campaignId', '=', campaignId)
        .orderBy('name')
        .execute();
    },
  };
}

export type CharactersRepository = ReturnType<typeof charactersRepository>;
