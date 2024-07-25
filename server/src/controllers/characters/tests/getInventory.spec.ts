import { authContext, requestContext } from '@server/tests/utils/context';
import {
  fakeCampaign,
  fakeCharacter,
  fakeCharacterItem,
  fakeItem,
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
  const { getInventory } = createCaller(requestContext({ db }));
  const [user] = await insertAll(db, 'users', fakeUser());
  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );

  await expect(getInventory(character.id)).rejects.toThrow(/unauthenticated/i);
});

it('should return an empty list if character has no items', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getInventory } = createCaller(requestContext({ db, authUser: user }));
  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );

  expect(await getInventory(character.id)).toHaveLength(0);
});

it('should return a all items that belongs to character', async () => {
  const [user] = await insertAll(db, 'users', fakeUser());
  const { getInventory } = createCaller(requestContext({ db, authUser: user }));
  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );
  const [itemOne, itemTwo] = await insertAll(db, 'items', [
    fakeItem(),
    fakeItem(),
  ]);
  await insertAll(db, 'charactersItems', [
    fakeCharacterItem({ characterId: character.id, itemId: itemOne.id }),
    fakeCharacterItem({ characterId: character.id, itemId: itemTwo.id }),
  ]);

  const inventory = await getInventory(character.id);

  expect(inventory).toHaveLength(2);
  expect(inventory).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: itemOne.id }),
      expect.objectContaining({ id: itemTwo.id }),
    ])
  );
});
