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
import { clearTables, insertAll } from '@server/tests/utils/records';
import charactersRouter from '..';

const createCaller = createCallerFactory(charactersRouter);
const db = await wrapInRollbacks(createTestDatabase());

await clearTables(db, ['characters']);

it('should throw an error if user is not authenticated', async () => {
  const { getAll } = createCaller(requestContext({ db }));

  await expect(getAll()).rejects.toThrow(/unauthenticated/i);
});

it('should throw an error if user is not admin', async () => {
  const { getAll } = createCaller(authContext({ db }));

  await expect(getAll()).rejects.toThrow(/denied/i);
});

it('should return an empty list, if there are no characters', async () => {
  const { getAll } = createCaller(adminContext({ db }));

  expect(await getAll()).toHaveLength(0);
});

it('should return a list of characters', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getAll } = createCaller(adminContext({ db }));

  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

  await insertAll(db, 'characters', [
    fakeCharacter({ userId: user.id, campaignId: campaign.id }),
  ]);

  const characters = await getAll();

  expect(characters).toHaveLength(1);
});

it('should return characters in alphabetical order', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getAll } = createCaller(adminContext({ db }));

  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

  const [characterOne] = await insertAll(db, 'characters', [
    fakeCharacter({
      name: 'Thia Galadon',
      userId: user.id,
      campaignId: campaign.id,
    }),
  ]);
  const [characterTwo] = await insertAll(db, 'characters', [
    fakeCharacter({
      name: 'Baern Stormwind',
      userId: user.id,
      campaignId: campaign.id,
    }),
  ]);

  const campaigns = await getAll();

  expect(campaigns![0]).toMatchObject(characterTwo);
  expect(campaigns![1]).toMatchObject(characterOne);
});
