import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { Campaigns } from '@server/database/types';
import { idSchema } from './shared';

export const campaignSchema = z.object({
  id: idSchema,
  name: z
    .string()
    .min(3, 'Campaign name must be at least 3 characters long')
    .max(30, 'Campaign name must be at most 30 characters long'),
});

export const campaignKeysAll = Object.keys(
  campaignSchema.shape
) as (keyof Campaigns)[];

export const campaignKeysPublic = campaignKeysAll;

export type CampaignPublic = Pick<
  Selectable<Campaigns>,
  (typeof campaignKeysPublic)[number]
>;
