import {
  authContext,
  adminContext,
  requestContext,
} from '@server/tests/utils/context';
import { fakeItem } from '@server/tests/utils/fakes';
import { createTestDatabase } from '@server/tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { selectAll } from '@server/tests/utils/records';
import itemsRouter from '..';

const createCaller = createCallerFactory(itemsRouter);
const db = await wrapInRollbacks(createTestDatabase());

it('should throw an error if user is not authenticated', async () => {
  const { create } = createCaller(requestContext({ db }));

  await expect(create(fakeItem())).rejects.toThrow(/unauthenticated/i);
});

it('should throw an error if user is not admin', async () => {
  const { create } = createCaller(authContext({ db }));

  await expect(create(fakeItem())).rejects.toThrow(/denied/i);
});

it('should create a persisted item if user is admin', async () => {
  const { create } = createCaller(adminContext({ db }));

  const itemReturned = await create(fakeItem({ name: 'Arcane Staff' }));

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
