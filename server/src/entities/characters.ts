import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { Characters } from '@server/database/types';
import { idSchema } from './shared';

export const characterSchema = z.object({
  id: idSchema,
  name: z
    .string()
    .min(1, 'Character name must be at least 1 character long')
    .max(30, 'Character name must be at most 30 characters long'),
  downtime: z.number().int().nonnegative(),
  userId: idSchema,
  campaignId: idSchema,
});

export const characterKeysAll = Object.keys(
  characterSchema.shape
) as (keyof Characters)[];

export const characterKeysPublic = characterKeysAll;

export type CharacterPublic = Pick<
  Selectable<Characters>,
  (typeof characterKeysPublic)[number]
>;
