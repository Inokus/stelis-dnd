import type { Database } from '@server/database';
import type { Transactions } from '@server/database/types';
import {
  type TransactionPublic,
  type TransactionWithNamePublic,
  transactionKeysPublic,
} from '@server/entities/transactions';
import type { Insertable } from 'kysely';

export function transactionsRepository(db: Database) {
  return {
    async create(
      transaction: Insertable<Transactions>
    ): Promise<TransactionPublic> {
      return db
        .insertInto('transactions')
        .values(transaction)
        .returning(transactionKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async getAll(characterId: number): Promise<TransactionPublic[]> {
      return db
        .selectFrom('transactions as t')
        .innerJoin('items as i', 'i.id', 't.itemId')
        .select([
          ...transactionKeysPublic.map((key) => `t.${key}`),
          'i.name',
        ] as (keyof TransactionWithNamePublic)[])
        .where('characterId', '=', characterId)
        .orderBy('id', 'desc')
        .execute();
    },
  };
}

export type TransactionsRepository = ReturnType<typeof transactionsRepository>;
