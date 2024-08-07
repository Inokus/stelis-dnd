import {
  authContext,
  adminContext,
  requestContext,
} from '@tests/utils/context';
import { createTestDatabase } from '@tests/utils/database';
import { fakeCampaign } from '@tests/utils/fakes';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { selectAll } from '@tests/utils/records';
import { pick } from 'lodash-es';
import { campaignKeysPublic } from '@server/entities/campaigns';
import campaignsRouter from '..';

const createCaller = createCallerFactory(campaignsRouter);
const db = await wrapInRollbacks(createTestDatabase());

const campaign = fakeCampaign();

it('should throw an error if user is not authenticated', async () => {
  const { create } = createCaller(requestContext({ db }));

  await expect(create(campaign)).rejects.toThrow(/unauthenticated/i);
});

it('should throw an error if user is not admin', async () => {
  const { create } = createCaller(authContext({ db }));

  await expect(create(campaign)).rejects.toThrow(/denied/i);
});

it('should create a persisted campaign', async () => {
  const { create } = createCaller(adminContext({ db }));

  const campaignReturned = await create(campaign);

  expect(campaignReturned).toEqual({
    ...pick(campaign, campaignKeysPublic),
    id: expect.any(Number),
    createdAt: expect.any(Date),
  });

  const [campaignCreated] = await selectAll(db, 'campaigns', (eb) =>
    eb('id', '=', campaignReturned.id)
  );

  expect(campaignCreated).toEqual(campaignReturned);
});
