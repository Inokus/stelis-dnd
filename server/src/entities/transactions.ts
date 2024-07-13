import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { Transactions } from '@server/database/types';
import { idSchema } from './shared';

export const transactionSchema = z.object({
  id: idSchema,
  type: z.string(),
  quantity: z.number().int().positive(),
  value: z.number().int().nonnegative(),
  characterId: idSchema,
  itemId: idSchema,
  createdAt: z.date().default(() => new Date()),
});

export const transactionKeysAll = Object.keys(
  transactionSchema.shape
) as (keyof Transactions)[];

export const transactionKeysPublic = transactionKeysAll;

export type TransactionPublic = Pick<
  Selectable<Transactions>,
  (typeof transactionKeysPublic)[number]
>;
