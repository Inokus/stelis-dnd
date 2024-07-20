import {
  authContext,
  adminContext,
  requestContext,
} from '@server/tests/utils/context';
import { createTestDatabase } from '@server/tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { selectAll } from '@server/tests/utils/records';
import campaignsRouter from '..';

const createCaller = createCallerFactory(campaignsRouter);
const db = await wrapInRollbacks(createTestDatabase());

it('should throw an error if user is not authenticated', async () => {
  const { create } = createCaller(requestContext({ db }));

  await expect(
    create({
      name: 'Lost Legend of the Ancients',
    })
  ).rejects.toThrow(/unauthenticated/i);
});

it('should throw an error if user is not admin', async () => {
  const { create } = createCaller(authContext({ db }));

  await expect(
    create({
      name: 'Lost Legend of the Ancients',
    })
  ).rejects.toThrow(/denied/i);
});

it('should create a persisted campaign', async () => {
  const { create } = createCaller(adminContext({ db }));

  const campaignReturned = await create({
    name: 'Lost Legend of the Ancients',
  });

  expect(campaignReturned).toMatchObject({
    id: expect.any(Number),
    name: 'Lost Legend of the Ancients',
    createdAt: expect.any(Date),
  });

  const [campaignCreated] = await selectAll(db, 'campaigns', (eb) =>
    eb('id', '=', campaignReturned.id)
  );

  expect(campaignCreated).toMatchObject(campaignReturned);
});
