import { createTestDatabase } from '@server/tests/utils/database';
import {
  fakeTransaction,
  fakeUser,
  fakeCampaign,
  fakeCharacter,
  fakeItem,
} from '@server/tests/utils/fakes';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll } from '@server/tests/utils/records';
import { pick } from 'lodash-es';
import { transactionKeysPublic } from '@server/entities/transactions';
import { transactionsRepository } from '../transactionsRepository';

const db = await wrapInRollbacks(createTestDatabase());
const repository = transactionsRepository(db);

const [user] = await insertAll(db, 'users', fakeUser());
const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
const [character] = await insertAll(
  db,
  'characters',
  fakeCharacter({ userId: user.id, campaignId: campaign.id })
);
const [item] = await insertAll(db, 'items', fakeItem());

describe('create', () => {
  it('should create a new transaction', async () => {
    const transaction = fakeTransaction({
      characterId: character.id,
      itemId: item.id,
    });

    const createdTransaction = await repository.create(transaction);

    expect(createdTransaction).toEqual({
      ...pick(transaction, transactionKeysPublic),
      id: expect.any(Number),
      createdAt: expect.any(Date),
    });
  });
});

describe('getAll', () => {
  it('should get all character transactions', async () => {
    await insertAll(db, 'transactions', [
      fakeTransaction({ characterId: character.id, itemId: item.id }),
      fakeTransaction({ characterId: character.id, itemId: item.id }),
      fakeTransaction({ characterId: character.id, itemId: item.id }),
    ]);

    const allTransactions = await repository.getAll(character.id);

    expect(allTransactions).toHaveLength(3);
  });
});
