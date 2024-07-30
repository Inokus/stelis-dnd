import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { Transactions } from '@server/database/types';
import { createdAtSchema, idSchema } from './shared';

export const transactionTypes = ['Buy', 'Sell'] as const;

export const transactionSchema = z.object({
  id: idSchema,
  type: z.enum(transactionTypes, {
    errorMap: () => ({ message: 'Invalid transaction type' }),
  }),
  quantity: z.number().int().positive(),
  value: z.number().int().nonnegative(),
  characterId: idSchema,
  itemId: idSchema,
  createdAt: createdAtSchema,
});

export const transactionKeysAll = Object.keys(
  transactionSchema.shape
) as (keyof Transactions)[];

export const transactionKeysPublic = transactionKeysAll;

export type TransactionPublic = Pick<
  Selectable<Transactions>,
  (typeof transactionKeysPublic)[number]
>;

export type TransactionWithNamePublic = TransactionPublic & { name: string };
