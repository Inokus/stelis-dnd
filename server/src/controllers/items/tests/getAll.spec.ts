import { authContext, requestContext } from '@server/tests/utils/context';
import { fakeItem } from '@server/tests/utils/fakes';
import { createTestDatabase } from '@server/tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { clearTables, insertAll } from '@server/tests/utils/records';
import itemsRouter from '..';

const createCaller = createCallerFactory(itemsRouter);
const db = await wrapInRollbacks(createTestDatabase());

await clearTables(db, ['items']);

it('should throw an error if user is not authenticated', async () => {
  const { getAll } = createCaller(requestContext({ db }));

  await expect(getAll()).rejects.toThrow(/unauthenticated/i);
});

it('should return an empty list, if there are no items', async () => {
  const { getAll } = createCaller(authContext({ db }));

  expect(await getAll()).toHaveLength(0);
});

it('should return a list of items', async () => {
  const { getAll } = createCaller(authContext({ db }));

  await insertAll(db, 'items', [fakeItem()]);

  const campaigns = await getAll();

  expect(campaigns).toHaveLength(1);
});

it('should return items in alphabetical order', async () => {
  const { getAll } = createCaller(authContext({ db }));

  const [itemOne, itemTwo] = await insertAll(db, 'items', [
    fakeItem({ name: 'Cursed Sword' }),
    fakeItem({ name: 'Arcane Staff' }),
  ]);

  const items = await getAll();

  expect(items[0]).toMatchObject(itemTwo);
  expect(items[1]).toMatchObject(itemOne);
});
