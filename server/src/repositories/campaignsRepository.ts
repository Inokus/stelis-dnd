import type { Database } from '@server/database';
import type { Campaigns } from '@server/database/types';
import {
  type CampaignPublic,
  campaignKeysPublic,
} from '@server/entities/campaigns';
import type { Insertable } from 'kysely';

export function campaignsRepository(db: Database) {
  return {
    async create(campaign: Insertable<Campaigns>): Promise<CampaignPublic> {
      return db
        .insertInto('campaigns')
        .values(campaign)
        .returning(campaignKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async getAvailable(userId: number): Promise<CampaignPublic[]> {
      return db
        .selectFrom('campaigns as c')
        .innerJoin('characters as ch', 'ch.campaignId', 'c.id')
        .select(
          campaignKeysPublic.map(
            (key) => `c.${key}`
          ) as (keyof CampaignPublic)[]
        )
        .where('ch.userId', '=', userId)
        .distinct()
        .orderBy('name')
        .execute();
    },

    async getAll(): Promise<CampaignPublic[]> {
      return db
        .selectFrom('campaigns')
        .select(campaignKeysPublic)
        .orderBy('name')
        .execute();
    },
  };
}

export type CampaignsRepository = ReturnType<typeof campaignsRepository>;
