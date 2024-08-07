import {
  authContext,
  adminContext,
  requestContext,
} from '@tests/utils/context';
import { fakeItem } from '@tests/utils/fakes';
import { createTestDatabase } from '@tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll, selectAll } from '@tests/utils/records';
import itemsRouter from '..';

const createCaller = createCallerFactory(itemsRouter);
const db = await wrapInRollbacks(createTestDatabase());

const items = await insertAll(db, 'items', [fakeItem(), fakeItem()]);

it('should throw an error if user is not authenticated', async () => {
  const { remove } = createCaller(requestContext({ db }));

  await expect(remove({ id: items[0].id })).rejects.toThrow(/unauthenticated/i);
});

it('should throw an error if user is not admin', async () => {
  const { remove } = createCaller(authContext({ db }));

  await expect(remove({ id: items[0].id })).rejects.toThrow(/denied/i);
});

it('should throw an error if item does not exist', async () => {
  const { remove } = createCaller(adminContext({ db }));

  await expect(remove({ id: 1000000 })).rejects.toThrow(/no result/i);
});

it('should remove an item if user is admin', async () => {
  const { remove } = createCaller(adminContext({ db }));

  const itemReturned = await remove({
    id: items[0].id,
  });

  expect(itemReturned).toMatchObject(items[0]);

  const allItems = await selectAll(db, 'items');

  expect(allItems).toHaveLength(1);
  expect(allItems[0]).toMatchObject(items[1]);
});
