import type { Database } from '@server/database';
import type { Downtimes } from '@server/database/types';
import {
  type DowntimePublic,
  downtimeKeysPublic,
} from '@server/entities/downtimes';
import type { Insertable } from 'kysely';

export function downtimesRepository(db: Database) {
  return {
    async create(downtime: Insertable<Downtimes>): Promise<DowntimePublic> {
      return db
        .insertInto('downtimes')
        .values(downtime)
        .returning(downtimeKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async getAll(characterId: number): Promise<DowntimePublic[]> {
      return db
        .selectFrom('downtimes')
        .select(downtimeKeysPublic)
        .where('characterId', '=', characterId)
        .orderBy('id', 'desc')
        .execute();
    },
  };
}

export type DowntimesRepository = ReturnType<typeof downtimesRepository>;
