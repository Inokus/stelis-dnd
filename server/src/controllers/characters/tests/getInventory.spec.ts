import { requestContext } from '@tests/utils/context';
import {
  fakeCampaign,
  fakeCharacter,
  fakeCharacterItem,
  fakeItem,
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
  const { getInventory } = createCaller(requestContext({ db }));
  const [user] = await insertAll(db, 'users', fakeUser());
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
  const [character] = await insertAll(
    db,
    'characters',
    fakeCharacter({ userId: user.id, campaignId: campaign.id })
  );
  const items = await insertAll(db, 'items', [
    fakeItem({ name: 'Radiant Sword' }),
    fakeItem({ name: 'Ancient Staff' }),
  ]);
  await insertAll(db, 'charactersItems', [
    fakeCharacterItem({ characterId: character.id, itemId: items[0].id }),
    fakeCharacterItem({ characterId: character.id, itemId: items[1].id }),
  ]);

  const inventory = await getInventory(character.id);

  expect(inventory).toHaveLength(2);
  expect(inventory).toEqual([
    { ...items[1], quantity: expect.any(Number) },
    { ...items[0], quantity: expect.any(Number) },
  ]);
});
