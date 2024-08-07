import {
  authContext,
  adminContext,
  requestContext,
} from '@tests/utils/context';
import { fakeCampaign, fakeCharacter, fakeUser } from '@tests/utils/fakes';
import { createTestDatabase } from '@tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll, selectAll } from '@tests/utils/records';
import charactersRouter from '..';

const createCaller = createCallerFactory(charactersRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
const character = fakeCharacter();

it('should throw an error if user is not authenticated', async () => {
  const { create } = createCaller(requestContext({ db }));

  await expect(
    create({
      characterData: {
        name: character.name,
        campaignId: campaign.id,
      },
    })
  ).rejects.toThrow(/unauthenticated/i);
});

it('should throw an error if user does not have any characters in that campaign', async () => {
  const { create } = createCaller(authContext({ db }));

  await expect(
    create({
      characterData: {
        name: character.name,
        campaignId: campaign.id,
      },
    })
  ).rejects.toThrow(/denied/i);
});

it('should create a persisted character if user had prior characters in that campaign', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { create } = createCaller(requestContext({ db, authUser: user }));

  await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );

  const characterReturned = await create({
    characterData: {
      name: character.name,
      campaignId: campaign.id,
    },
  });

  expect(characterReturned).toMatchObject({
    id: expect.any(Number),
    name: character.name,
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

  const characterReturned = await create({
    characterData: {
      name: character.name,
      campaignId: campaign.id,
    },
    userId: user.id,
  });

  expect(characterReturned).toMatchObject({
    id: expect.any(Number),
    name: character.name,
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
