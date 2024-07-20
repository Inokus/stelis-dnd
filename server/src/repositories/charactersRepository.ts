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

    async getAvailable(userId: number): Promise<CharacterPublic[]> {
      return db
        .selectFrom('characters')
        .select(characterKeysPublic)
        .where('userId', '=', userId)
        .orderBy('name')
        .execute();
    },

    async getAll(): Promise<CharacterPublic[]> {
      return db
        .selectFrom('characters')
        .select(characterKeysPublic)
        .orderBy('name')
        .execute();
    },
  };
}

export type CharactersRepository = ReturnType<typeof charactersRepository>;
