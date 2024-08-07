import { requestContext } from '@tests/utils/context';
import {
  fakeCampaign,
  fakeCharacter,
  fakeDowntime,
  fakeUser,
} from '@tests/utils/fakes';
import { createTestDatabase } from '@tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/records';
import charactersRouter from '..';

const createCaller = createCallerFactory(charactersRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

it('should throw an error if user is not authenticated', async () => {
  const { getDowntimes } = createCaller(requestContext({ db }));
  const [user] = await insertAll(db, 'users', fakeUser());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );

  await expect(getDowntimes(character.id)).rejects.toThrow(/unauthenticated/i);
});

it('should return an empty list if character has no downtimes', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getDowntimes } = createCaller(requestContext({ db, authUser: user }));
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );

  expect(await getDowntimes(character.id)).toHaveLength(0);
});

it('should return a all downtimes that belongs to character', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getDowntimes } = createCaller(requestContext({ db, authUser: user }));
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );
  const downtimes = await insertAll(db, 'downtimes', [
    fakeDowntime({ characterId: character.id }),
    fakeDowntime({ characterId: character.id }),
  ]);

  const allDowntimes = await getDowntimes(character.id);

  expect(allDowntimes).toHaveLength(2);
  expect(allDowntimes[0]).toMatchObject(downtimes[1]);
  expect(allDowntimes[1]).toMatchObject(downtimes[0]);
});
