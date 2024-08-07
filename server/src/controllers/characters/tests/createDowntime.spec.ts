import { requestContext } from '@tests/utils/context';
import {
  fakeCampaign,
  fakeUser,
  fakeCharacter,
  fakeDowntime,
} from '@tests/utils/fakes';
import { createTestDatabase } from '@tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll, selectAll } from '@tests/utils/records';
import charactersRouter from '..';

const createCaller = createCallerFactory(charactersRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

it('should throw an error if user is not authenticated', async () => {
  const { createDowntime } = createCaller(requestContext({ db }));

  const [user] = await insertAll(db, 'users', fakeUser());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ campaignId: campaign.id, userId: user.id })
  );
  const downtime = fakeDowntime({ characterId: character.id });

  await expect(createDowntime(downtime)).rejects.toThrow(/unauthenticated/i);
});

it('should an error if new character downtime is negative', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { createDowntime } = createCaller(
    requestContext({ db, authUser: user })
  );

  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ campaignId: campaign.id, userId: user.id, downtime: 10 })
  );
  const downtime = fakeDowntime({ characterId: character.id, days: 11 });

  await expect(createDowntime(downtime)).rejects.toThrow(/negative/i);
});

it('should create a persisted downtime and update character', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { createDowntime } = createCaller(
    requestContext({ db, authUser: user })
  );

  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id, downtime: 10 })
  );
  const downtime = fakeDowntime({ characterId: character.id, days: 5 });

  const downtimeReturned = await createDowntime(downtime);

  const [characterUpdated] = await selectAll(db, 'characters');
  const [downtimeCreated] = await selectAll(db, 'downtimes');

  expect(downtimeReturned.downtimeCreated).toMatchObject({
    id: expect.any(Number),
    ...downtime,
    createdAt: expect.any(Date),
  });
  expect(downtimeReturned.newDowntime).toBe(character.downtime - downtime.days);
  expect(characterUpdated.downtime).toBe(downtimeReturned.newDowntime);
  expect(downtimeReturned.downtimeCreated).toEqual(downtimeCreated);
});

it('should roll back the transaction if there is an error', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { createDowntime } = createCaller(
    requestContext({ db, authUser: user })
  );

  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ campaignId: campaign.id, userId: user.id, downtime: 10 })
  );
  const downtime = fakeDowntime({ characterId: character.id, days: 11 });

  await expect(createDowntime(downtime)).rejects.toThrow(/negative/i);

  const allCharacters = await selectAll(db, 'characters');
  const allDowntimes = await selectAll(db, 'downtimes');

  expect(allCharacters[0]).toEqual(character);
  expect(allDowntimes).toHaveLength(0);
});
