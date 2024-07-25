import {
  authContext,
  adminContext,
  requestContext,
} from '@server/tests/utils/context';
import { fakeItem } from '@server/tests/utils/fakes';
import { createTestDatabase } from '@server/tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll, selectAll } from '@server/tests/utils/records';
import itemsRouter from '..';

const createCaller = createCallerFactory(itemsRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [itemOne, itemTwo] = await insertAll(db, 'items', [
  fakeItem(),
  fakeItem(),
]);

it('should throw an error if user is not authenticated', async () => {
  const { remove } = createCaller(requestContext({ db }));

  await expect(remove({ id: itemOne.id })).rejects.toThrow(/unauthenticated/i);
});

it('should throw an error if user is not admin', async () => {
  const { remove } = createCaller(authContext({ db }));

  await expect(remove({ id: itemOne.id })).rejects.toThrow(/denied/i);
});

it('should throw an error if item does not exist', async () => {
  const { remove } = createCaller(adminContext({ db }));

  await expect(remove({ id: 1000000 })).rejects.toThrow(/no result/i);
});

it('should remove an item if user is admin', async () => {
  const { remove } = createCaller(adminContext({ db }));

  const itemReturned = await remove({
    id: itemOne.id,
  });

  expect(itemReturned).toMatchObject(itemOne);

  const items = await selectAll(db, 'items');

  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject(itemTwo);
});
