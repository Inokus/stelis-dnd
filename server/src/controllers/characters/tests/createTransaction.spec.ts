import { requestContext } from '@server/tests/utils/context';
import {
  fakeCampaign,
  fakeUser,
  fakeCharacter,
  fakeItem,
  fakeCharacterItem,
  fakeTransaction,
} from '@server/tests/utils/fakes';
import { createTestDatabase } from '@server/tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll, selectAll } from '@server/tests/utils/records';
import charactersRouter from '..';

const createCaller = createCallerFactory(charactersRouter);
const db = await wrapInRollbacks(createTestDatabase());

it('should throw an error if user is not authenticated', async () => {
  const { createTransaction } = createCaller(requestContext({ db }));

  const [user] = await insertAll(db, 'users', fakeUser());
  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ campaignId: campaign.id, userId: user.id })
  );
  const [item] = await insertAll(db, 'items', fakeItem());

  const transaction = fakeTransaction({
    characterId: character.id,
    itemId: item.id,
  });

  await expect(createTransaction(transaction)).rejects.toThrow(
    /unauthenticated/i
  );
});

it('should an error if character does not have the item when selling', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { createTransaction } = createCaller(
    requestContext({ db, authUser: user })
  );

  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ campaignId: campaign.id, userId: user.id })
  );
  const [item] = await insertAll(db, 'items', fakeItem());

  const transaction = fakeTransaction({
    type: 'Sell',
    characterId: character.id,
    itemId: item.id,
    quantity: 1,
  });

  await expect(createTransaction(transaction)).rejects.toThrow(/quantity/i);
});

it('should an error if character does not have a sufficient quantity of an item when selling', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { createTransaction } = createCaller(
    requestContext({ db, authUser: user })
  );

  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ campaignId: campaign.id, userId: user.id })
  );
  const [item] = await insertAll(db, 'items', fakeItem());
  await insertAll(
    db,
    'charactersItems',
    fakeCharacterItem({
      characterId: character.id,
      itemId: item.id,
      quantity: 1,
    })
  );

  const transaction = fakeTransaction({
    type: 'Sell',
    characterId: character.id,
    itemId: item.id,
    quantity: 2,
  });

  await expect(createTransaction(transaction)).rejects.toThrow(/quantity/i);
});

it('should create a persisted buy transaction and update character items', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { createTransaction } = createCaller(
    requestContext({ db, authUser: user })
  );

  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ campaignId: campaign.id, userId: user.id })
  );
  const [item] = await insertAll(db, 'items', fakeItem());

  const transaction = fakeTransaction({
    type: 'Buy',
    characterId: character.id,
    itemId: item.id,
    quantity: 2,
  });

  const transactionReturned = await createTransaction(transaction);

  expect(transactionReturned.item).toEqual({
    ...item,
    quantity: 2,
  });
  expect(transactionReturned.transactionCreated).toEqual({
    id: expect.any(Number),
    ...transaction,
    value: item.value * transaction.quantity,
    createdAt: expect.any(Date),
    name: item.name,
  });
});

it('should create a persisted sell transaction and update character items', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { createTransaction } = createCaller(
    requestContext({ db, authUser: user })
  );

  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ campaignId: campaign.id, userId: user.id })
  );
  const [item] = await insertAll(db, 'items', fakeItem());
  await insertAll(
    db,
    'charactersItems',
    fakeCharacterItem({
      characterId: character.id,
      itemId: item.id,
      quantity: 1,
    })
  );

  const transaction = fakeTransaction({
    type: 'Sell',
    characterId: character.id,
    itemId: item.id,
    quantity: 1,
  });

  const transactionReturned = await createTransaction(transaction);

  expect(transactionReturned.item).toEqual({
    ...item,
    quantity: 0,
  });
  expect(transactionReturned.transactionCreated).toEqual({
    id: expect.any(Number),
    ...transaction,
    value: item.value * transaction.quantity,
    createdAt: expect.any(Date),
    name: item.name,
  });
});

it('should roll back the transaction if there is an error', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { createTransaction } = createCaller(
    requestContext({ db, authUser: user })
  );

  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ campaignId: campaign.id, userId: user.id })
  );
  const [item] = await insertAll(db, 'items', fakeItem());
  const [characterItem] = await insertAll(
    db,
    'charactersItems',
    fakeCharacterItem({
      characterId: character.id,
      itemId: item.id,
      quantity: 1,
    })
  );

  const transaction = fakeTransaction({
    type: 'Sell',
    characterId: character.id,
    itemId: item.id,
    quantity: 2,
  });

  await expect(createTransaction(transaction)).rejects.toThrow(/quantity/i);

  const allCharacterItems = await selectAll(db, 'charactersItems');
  const allTransactions = await selectAll(db, 'transactions');

  expect(allCharacterItems[0]).toEqual(characterItem);
  expect(allTransactions).toHaveLength(0);
});
