import {
  authContext,
  adminContext,
  requestContext,
} from '@tests/utils/context';
import { fakeItem, fakeCampaign } from '@tests/utils/fakes';
import { createTestDatabase } from '@tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll, selectAll } from '@tests/utils/records';
import itemsRouter from '..';

const createCaller = createCallerFactory(itemsRouter);
const db = await wrapInRollbacks(createTestDatabase());

it('should throw an error if user is not authenticated', async () => {
  const { create } = createCaller(requestContext({ db }));

  await expect(create({ itemData: fakeItem() })).rejects.toThrow(
    /unauthenticated/i
  );
});

it('should throw an error if user is not admin', async () => {
  const { create } = createCaller(authContext({ db }));

  await expect(create({ itemData: fakeItem() })).rejects.toThrow(/denied/i);
});

it('should create a persisted item if user is admin', async () => {
  const { create } = createCaller(adminContext({ db }));

  const itemReturned = await create({
    itemData: fakeItem({ name: 'Arcane Staff' }),
  });

  expect(itemReturned).toMatchObject({
    id: expect.any(Number),
    name: 'Arcane Staff',
    description: expect.any(String),
    value: expect.any(Number),
    isCurrency: false,
  });

  const [itemCreated] = await selectAll(db, 'items', (eb) =>
    eb('id', '=', itemReturned.id)
  );

  expect(itemCreated).toMatchObject(itemReturned);
});

it('should create a persisted item as restricted item if campaignId is provided and user is admin', async () => {
  const { create } = createCaller(adminContext({ db }));

  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

  const itemReturned = await create({
    itemData: fakeItem({ name: 'Arcane Staff' }),
    campaignId: campaign.id,
  });

  expect(itemReturned).toMatchObject({
    id: expect.any(Number),
    name: 'Arcane Staff',
    description: expect.any(String),
    value: expect.any(Number),
    isCurrency: false,
  });

  const [restrictedItemCreated] = await selectAll(db, 'restrictedItems', (eb) =>
    eb('itemId', '=', itemReturned.id)
  );

  expect(restrictedItemCreated).toEqual({
    id: expect.any(Number),
    itemId: itemReturned.id,
    campaignId: campaign.id,
  });
});

it('should roll back the transaction if there is an error', async () => {
  const { create } = createCaller(adminContext({ db }));

  await expect(
    create({
      itemData: fakeItem({ name: 'Arcane Staff' }),
      campaignId: 1000000,
    })
  ).rejects.toThrow();

  const items = await selectAll(db, 'items');
  const restrictedItems = await selectAll(db, 'restrictedItems');

  expect(items).toHaveLength(0);
  expect(restrictedItems).toHaveLength(0);
});
