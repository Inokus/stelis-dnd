import {
  authContext,
  adminContext,
  requestContext,
} from '@server/tests/utils/context';
import {
  fakeCampaign,
  fakeCharacter,
  fakeUser,
} from '@server/tests/utils/fakes';
import { createTestDatabase } from '@server/tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll } from '@server/tests/utils/records';
import { pick } from 'lodash-es';
import campaignsRouter from '..';
import { campaignKeysPublic } from '@server/entities/campaigns';

const createCaller = createCallerFactory(campaignsRouter);
const db = await wrapInRollbacks(createTestDatabase());

it('should throw an error if user is not authenticated', async () => {
  const { getAvailable } = createCaller(requestContext({ db }));

  await expect(getAvailable()).rejects.toThrow(/unauthenticated/i);
});

it('should return an empty list, if there are no campaigns that user has characters in', async () => {
  const { getAvailable } = createCaller(authContext({ db }));

  await insertAll(db, 'campaigns', fakeCampaign());

  expect(await getAvailable()).toHaveLength(0);
});

it('should return a list of campaigns that user has characters in', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getAvailable } = createCaller(requestContext({ db, authUser: user }));

  const campaigns = await insertAll(db, 'campaigns', [
    fakeCampaign(),
    fakeCampaign(),
  ]);

  await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaigns[0].id })
  );

  const availableCampaigns = await getAvailable();

  expect(availableCampaigns).toHaveLength(1);
  expect(availableCampaigns[0]).toEqual({
    ...pick(campaigns[0], campaignKeysPublic),
  });
});

it('should return all campaigns if user is admin', async () => {
  const { getAvailable } = createCaller(adminContext({ db }));

  await insertAll(db, 'campaigns', [fakeCampaign(), fakeCampaign()]);

  const availableCampaigns = await getAvailable();

  expect(availableCampaigns).toHaveLength(2);
});

it('should return campaigns in alphabetical order', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getAvailable } = createCaller(requestContext({ db, authUser: user }));

  const campaigns = await insertAll(db, 'campaigns', [
    fakeCampaign({ name: 'Lost Legend of the Ancients' }),
    fakeCampaign({ name: 'Epic Quest of the Dragon' }),
  ]);
  await insertAll(db, 'characters', [
    fakeCharacter({ userId: user.id, campaignId: campaigns[0].id }),
    fakeCharacter({ userId: user.id, campaignId: campaigns[1].id }),
  ]);

  const availableCampaigns = await getAvailable();

  expect(availableCampaigns).toHaveLength(2);
  expect(availableCampaigns).toEqual([
    {
      ...pick(campaigns[1], campaignKeysPublic),
    },
    {
      ...pick(campaigns[0], campaignKeysPublic),
    },
  ]);
});
