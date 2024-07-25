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
import { insertAll, selectAll } from '@server/tests/utils/records';
import charactersRouter from '..';

const createCaller = createCallerFactory(charactersRouter);
const db = await wrapInRollbacks(createTestDatabase());

it('should throw an error if user is not authenticated', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  const { create } = createCaller(requestContext({ db }));

  await expect(
    create({
      characterData: {
        name: 'Thia Galadon',
        campaignId: campaign.id,
      },
    })
  ).rejects.toThrow(/unauthenticated/i);
});

it('should throw an error if user does not have any characters in that campaign', async () => {
  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  const { create } = createCaller(authContext({ db }));

  await expect(
    create({
      characterData: {
        name: 'Thia Galadon',
        campaignId: campaign.id,
      },
    })
  ).rejects.toThrow(/denied/i);
});

it('should create a persisted character if user had prior characters in that campaign', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { create } = createCaller(requestContext({ db, authUser: user }));

  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );

  const characterReturned = await create({
    characterData: {
      name: 'Thia Galadon',
      campaignId: campaign.id,
    },
  });

  expect(characterReturned).toMatchObject({
    id: expect.any(Number),
    name: 'Thia Galadon',
    downtime: expect.any(Number),
    userId: user.id,
    campaignId: campaign.id,
    createdAt: expect.any(Date),
  });

  const [characterCreated] = await selectAll(db, 'characters', (eb) =>
    eb('id', '=', characterReturned.id)
  );

  expect(characterCreated).toMatchObject(characterReturned);
});

it('should create a persisted character if user is admin', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { create } = createCaller(adminContext({ db }));

  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

  const characterReturned = await create({
    characterData: {
      name: 'Thia Galadon',
      campaignId: campaign.id,
    },
    userId: user.id,
  });

  expect(characterReturned).toMatchObject({
    id: expect.any(Number),
    name: 'Thia Galadon',
    downtime: expect.any(Number),
    userId: user.id,
    campaignId: campaign.id,
    createdAt: expect.any(Date),
  });

  const [characterCreated] = await selectAll(db, 'characters', (eb) =>
    eb('id', '=', characterReturned.id)
  );

  expect(characterCreated).toMatchObject(characterReturned);
});
