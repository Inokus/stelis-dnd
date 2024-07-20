import {
  authContext,
  adminContext,
  requestContext,
} from '@server/tests/utils/context';
import { fakeCampaign } from '@server/tests/utils/fakes';
import { createTestDatabase } from '@server/tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { clearTables, insertAll } from '@server/tests/utils/records';
import campaignsRouter from '..';

const createCaller = createCallerFactory(campaignsRouter);
const db = await wrapInRollbacks(createTestDatabase());

await clearTables(db, ['campaigns']);

it('should throw an error if user is not authenticated', async () => {
  const { getAll } = createCaller(requestContext({ db }));

  await expect(getAll()).rejects.toThrow(/unauthenticated/i);
});

it('should throw an error if user is not admin', async () => {
  const { getAll } = createCaller(authContext({ db }));

  await expect(getAll()).rejects.toThrow(/denied/i);
});

it('should return an empty list, if there are no campaigns', async () => {
  const { getAll } = createCaller(adminContext({ db }));

  expect(await getAll()).toHaveLength(0);
});

it('should return a list of campaigns', async () => {
  const { getAll } = createCaller(adminContext({ db }));

  await insertAll(db, 'campaigns', [fakeCampaign()]);

  const campaigns = await getAll();

  expect(campaigns).toHaveLength(1);
});

it('should return campaigns in alphabetical order', async () => {
  const { getAll } = createCaller(adminContext({ db }));

  const [campaignOne] = await insertAll(db, 'campaigns', [
    fakeCampaign({ name: 'Lost Legend of the Ancients' }),
  ]);
  const [campaignTwo] = await insertAll(db, 'campaigns', [
    fakeCampaign({ name: 'Epic Quest of the Dragon' }),
  ]);

  const campaigns = await getAll();

  expect(campaigns[0]).toMatchObject(campaignTwo);
  expect(campaigns[1]).toMatchObject(campaignOne);
});
