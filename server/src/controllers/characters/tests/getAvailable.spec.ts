import { authContext, requestContext } from '@tests/utils/context';
import { fakeCampaign, fakeCharacter, fakeUser } from '@tests/utils/fakes';
import { createTestDatabase } from '@tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/records';
import charactersRouter from '..';

const createCaller = createCallerFactory(charactersRouter);
const db = await wrapInRollbacks(createTestDatabase());

it('should throw an error if user is not authenticated', async () => {
  const { getAvailable } = createCaller(requestContext({ db }));
  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

  await expect(getAvailable(campaign.id)).rejects.toThrow(/unauthenticated/i);
});

it('should return an empty list if user has no characters', async () => {
  const { getAvailable } = createCaller(authContext({ db }));
  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

  expect(await getAvailable(campaign.id)).toHaveLength(0);
});

it('should return a all campaign characters that belongs to user', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getAvailable } = createCaller(requestContext({ db, authUser: user }));

  const [campaignOne, campaignTwo] = await insertAll(db, 'campaigns', [
    fakeCampaign(),
    fakeCampaign(),
  ]);

  await insertAll(db, 'characters', [
    fakeCharacter({ userId: user.id, campaignId: campaignOne.id }),
    fakeCharacter({ userId: user.id, campaignId: campaignOne.id }),
    fakeCharacter({ userId: user.id, campaignId: campaignTwo.id }),
  ]);

  const characters = await getAvailable(campaignOne.id);

  expect(characters).toHaveLength(2);
});

it('should return characters in alphabetical order', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getAvailable } = createCaller(requestContext({ db, authUser: user }));

  const [campaign] = await insertAll(db, 'campaigns', [fakeCampaign()]);
  const characters = await insertAll(db, 'characters', [
    fakeCharacter({
      name: 'Thia Galadon',
      userId: user.id,
      campaignId: campaign.id,
    }),
    fakeCharacter({
      name: 'Baern Stormwind',
      userId: user.id,
      campaignId: campaign.id,
    }),
  ]);

  const availableCharacters = await getAvailable(campaign.id);

  expect(characters).toHaveLength(2);
  expect(availableCharacters[0]).toMatchObject(characters[1]);
  expect(availableCharacters[1]).toMatchObject(characters[0]);
});
