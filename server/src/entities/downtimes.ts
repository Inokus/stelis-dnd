import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { Downtimes } from '@server/database/types';
import { createdAtSchema, idSchema } from './shared';

export const downtimeTypes = [
  'Carousing',
  'Relaxation',
  'Research',
  'Training: Fighting Style',
  'Training: Language/Tools',
  'Training: Level Up',
  'Training: Skill',
  'Wandering',
  'Wandering: Taking a New Path',
  'Working',
] as const;

export const downtimeSchema = z.object({
  id: idSchema,
  type: z.enum(downtimeTypes, {
    errorMap: () => ({ message: 'Invalid downtime type' }),
  }),
  days: z.number().int().positive(),
  description: z
    .string()
    .min(3, 'Downtime description must be at least 3 character long')
    .max(500, 'Downtime description must be at most 500 characters long'),
  characterId: idSchema,
  createdAt: createdAtSchema,
});

export const downtimeKeysAll = Object.keys(
  downtimeSchema.shape
) as (keyof Downtimes)[];

export const downtimeKeysPublic = downtimeKeysAll;

export type DowntimePublic = Pick<
  Selectable<Downtimes>,
  (typeof downtimeKeysPublic)[number]
>;
