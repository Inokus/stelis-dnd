import { authContext, requestContext } from '@server/tests/utils/context';
import {
  fakeCampaign,
  fakeCharacter,
  fakeUser,
} from '@server/tests/utils/fakes';
import { createTestDatabase } from '@server/tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { clearTables, insertAll } from '@server/tests/utils/records';
import campaignsRouter from '..';

const createCaller = createCallerFactory(campaignsRouter);
const db = await wrapInRollbacks(createTestDatabase());

await clearTables(db, ['campaigns']);

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

  const [_, campaignTwo] = await insertAll(db, 'campaigns', [
    fakeCampaign(),
    fakeCampaign(),
  ]);

  await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaignTwo.id })
  );

  const campaigns = await getAvailable();

  expect(campaigns).toHaveLength(1);
  expect(campaigns[0]).toMatchObject(campaignTwo);
});

it('should return campaigns in alphabetical order', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getAvailable } = createCaller(requestContext({ db, authUser: user }));

  const [campaignOne, campaignTwo] = await insertAll(db, 'campaigns', [
    fakeCampaign({ name: 'Lost Legend of the Ancients' }),
    fakeCampaign({ name: 'Epic Quest of the Dragon' }),
  ]);
  await insertAll(db, 'characters', [
    fakeCharacter({ userId: user.id, campaignId: campaignOne.id }),
    fakeCharacter({ userId: user.id, campaignId: campaignTwo.id }),
  ]);

  const campaigns = await getAvailable();

  expect(campaigns).toHaveLength(2);
  expect(campaigns![0]).toMatchObject(campaignTwo);
  expect(campaigns![1]).toMatchObject(campaignOne);
});
