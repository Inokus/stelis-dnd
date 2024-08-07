import { authContext, requestContext } from '@tests/utils/context';
import { fakeCampaign, fakeUser, fakeCharacter } from '@tests/utils/fakes';
import { createTestDatabase } from '@tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll, selectAll } from '@tests/utils/records';
import charactersRouter from '..';

const createCaller = createCallerFactory(charactersRouter);
const db = await wrapInRollbacks(createTestDatabase());

const [user] = await insertAll(db, 'users', fakeUser());
const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
const [character] = await insertAll(
  db,
  'characters',
  fakeCharacter({ campaignId: campaign.id, userId: user.id })
);

it('should throw an error if user is not authenticated', async () => {
  const { update } = createCaller(requestContext({ db }));

  await expect(update({ id: character.id, downtime: 10 })).rejects.toThrow(
    /unauthenticated/i
  );
});

it('should throw an error if character does not exist', async () => {
  const { update } = createCaller(authContext({ db }));

  await expect(update({ id: 1000000, downtime: 10 })).rejects.toThrow(
    /no result/i
  );
});

it('should update a character', async () => {
  const { update } = createCaller(authContext({ db }));

  const characterReturned = await update({ id: character.id, downtime: 10 });

  expect(characterReturned).toMatchObject({
    ...character,
    downtime: 10,
  });

  const [characterUpdated] = await selectAll(db, 'characters', (eb) =>
    eb('id', '=', characterReturned.id)
  );

  expect(characterUpdated).toMatchObject(characterReturned);
});
