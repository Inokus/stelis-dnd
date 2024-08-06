import { requestContext } from '@server/tests/utils/context';
import {
  fakeCampaign,
  fakeCharacter,
  fakeItem,
  fakeTransaction,
  fakeUser,
} from '@server/tests/utils/fakes';
import { createTestDatabase } from '@server/tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll } from '@server/tests/utils/records';
import charactersRouter from '..';

const createCaller = createCallerFactory(charactersRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

it('should throw an error if user is not authenticated', async () => {
  const { getTransactions } = createCaller(requestContext({ db }));
  const [user] = await insertAll(db, 'users', fakeUser());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );

  await expect(getTransactions(character.id)).rejects.toThrow(
    /unauthenticated/i
  );
});

it('should return an empty list if character has no transactions', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getTransactions } = createCaller(
    requestContext({ db, authUser: user })
  );
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );

  expect(await getTransactions(character.id)).toHaveLength(0);
});

it('should return a all transactions that belongs to character', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getTransactions } = createCaller(
    requestContext({ db, authUser: user })
  );
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );
  const [item] = await insertAll(db, 'items', fakeItem());

  const transactions = await insertAll(db, 'transactions', [
    fakeTransaction({ characterId: character.id, itemId: item.id }),
    fakeTransaction({ characterId: character.id, itemId: item.id }),
  ]);

  const allTransactions = await getTransactions(character.id);

  expect(allTransactions).toHaveLength(2);
  expect(allTransactions[0]).toMatchObject(transactions[1]);
  expect(allTransactions[1]).toMatchObject(transactions[0]);
});
