import type { Database } from '@server/database';
import type { Characters } from '@server/database/types';
import {
  type CharacterPublic,
  characterKeysPublic,
} from '@server/entities/characters';
import type { Insertable, Updateable } from 'kysely';

export function charactersRepository(db: Database) {
  return {
    async create(character: Insertable<Characters>): Promise<CharacterPublic> {
      return db
        .insertInto('characters')
        .values(character)
        .returning(characterKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async getById(characterId: number): Promise<CharacterPublic> {
      return db
        .selectFrom('characters')
        .select(characterKeysPublic)
        .where('id', '=', characterId)
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

    async update(
      id: number,
      updateData: Updateable<Characters>
    ): Promise<CharacterPublic> {
      return db
        .updateTable('characters')
        .set(updateData)
        .where('id', '=', id)
        .returning(characterKeysPublic)
        .executeTakeFirstOrThrow();
    },
  };
}

export type CharactersRepository = ReturnType<typeof charactersRepository>;
