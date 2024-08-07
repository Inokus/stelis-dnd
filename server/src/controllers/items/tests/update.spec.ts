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

const [item] = await insertAll(db, 'items', fakeItem());

it('should throw an error if user is not authenticated', async () => {
  const { update } = createCaller(requestContext({ db }));

  await expect(update({ ...item, name: 'Radiant Ring' })).rejects.toThrow(
    /unauthenticated/i
  );
});

it('should throw an error if user is not admin', async () => {
  const { update } = createCaller(authContext({ db }));

  await expect(update({ ...item, name: 'Radiant Ring' })).rejects.toThrow(
    /denied/i
  );
});

it('should throw an error if item does not exist', async () => {
  const { update } = createCaller(adminContext({ db }));

  await expect(
    update({ ...item, id: 1000000, name: 'Radiant Ring' })
  ).rejects.toThrow(/no result/i);
});

it('should update an item if user is admin', async () => {
  const { update } = createCaller(adminContext({ db }));

  const itemReturned = await update({ ...item, name: 'Radiant Ring' });

  expect(itemReturned).toMatchObject({
    ...item,
    name: 'Radiant Ring',
  });

  const [itemUpdated] = await selectAll(db, 'items', (eb) =>
    eb('id', '=', itemReturned.id)
  );

  expect(itemUpdated).toMatchObject(itemReturned);
});
