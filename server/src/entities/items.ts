import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { Items } from '@server/database/types';
import { idSchema } from './shared';

export const itemSchema = z.object({
  id: idSchema,
  name: z
    .string()
    .min(1, 'Item name must be at least 1 character long')
    .max(30, 'Item name must be at most 30 characters long'),
  description: z
    .string()
    .min(1, 'Item description must be at least 1 character long')
    .max(5000, 'Item description must be at most 5000 characters long'),
  value: z.number().int().positive(),
  isCurrency: z.boolean(),
});

export const itemKeysAll = Object.keys(itemSchema.shape) as (keyof Items)[];

export const itemKeysPublic = itemKeysAll;

export type ItemPublic = Pick<
  Selectable<Items>,
  (typeof itemKeysPublic)[number]
>;

export type ItemWithQuantityPublic = ItemPublic & { quantity: number };
