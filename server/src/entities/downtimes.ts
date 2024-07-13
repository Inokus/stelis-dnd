import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { Downtimes } from '@server/database/types';
import { idSchema } from './shared';

export const downtimeSchema = z.object({
  id: idSchema,
  type: z.string(),
  days: z.number().int().positive(),
  description: z
    .string()
    .min(3, 'Downtime description must be at least 3 character long')
    .max(500, 'Downtime description must be at most 500 characters long'),
  characterId: idSchema,
  createdAt: z.date().default(() => new Date()),
});

export const downtimeKeysAll = Object.keys(
  downtimeSchema.shape
) as (keyof Downtimes)[];

export const downtimeKeysPublic = downtimeKeysAll;

export type DowntimePublic = Pick<
  Selectable<Downtimes>,
  (typeof downtimeKeysPublic)[number]
>;
