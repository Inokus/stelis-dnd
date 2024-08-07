import { createTestDatabase } from '@tests/utils/database';
import {
  fakeCharacterItem,
  fakeUser,
  fakeCampaign,
  fakeCharacter,
  fakeItem,
} from '@tests/utils/fakes';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll, selectAll } from '@tests/utils/records';
import { pick } from 'lodash-es';
import { characterItemKeysPublic } from '@server/entities/charactersItems';
import { charactersItemsRepository } from '../charactersItemsRepository';

const db = await wrapInRollbacks(createTestDatabase());
const repository = charactersItemsRepository(db);

const [user] = await insertAll(db, 'users', fakeUser());
const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
const [character] = await insertAll(
  db,
  'characters',
  fakeCharacter({ userId: user.id, campaignId: campaign.id })
);

describe('create', () => {
  it('should create a new character item', async () => {
    const [item] = await insertAll(db, 'items', fakeItem());
    const characterItem = fakeCharacterItem({
      characterId: character.id,
      itemId: item.id,
    });

    const createdCharacterItem = await repository.create(characterItem);

    expect(createdCharacterItem).toEqual({
      ...pick(characterItem, characterItemKeysPublic),
      id: expect.any(Number),
    });
  });
});

describe('getAll', () => {
  it('should get all character items', async () => {
    const items = await insertAll(db, 'items', [
      fakeItem(),
      fakeItem(),
      fakeItem(),
    ]);
    await insertAll(db, 'charactersItems', [
      fakeCharacterItem({ characterId: character.id, itemId: items[0].id }),
      fakeCharacterItem({ characterId: character.id, itemId: items[1].id }),
      fakeCharacterItem({ characterId: character.id, itemId: items[2].id }),
    ]);

    const allCharacterItems = await repository.getAll(character.id);

    expect(allCharacterItems).toHaveLength(3);
  });
});

describe('update', () => {
  it('should update a character item', async () => {
    const [item] = await insertAll(db, 'items', [fakeItem()]);
    const [characterItem] = await insertAll(
      db,
      'charactersItems',
      fakeCharacterItem({ characterId: character.id, itemId: item.id })
    );

    const updatedCharacterItem = await repository.update(
      character.id,
      item.id,
      {
        quantity: 1000000,
      }
    );

    expect(updatedCharacterItem).toEqual({
      ...pick(characterItem, characterItemKeysPublic),
      quantity: 1000000,
    });
  });
});

describe('remove', () => {
  it('should remove an item', async () => {
    const items = await insertAll(db, 'items', [
      fakeItem(),
      fakeItem(),
      fakeItem(),
    ]);
    const characterItems = await insertAll(db, 'charactersItems', [
      fakeCharacterItem({ characterId: character.id, itemId: items[0].id }),
      fakeCharacterItem({ characterId: character.id, itemId: items[1].id }),
      fakeCharacterItem({ characterId: character.id, itemId: items[2].id }),
    ]);

    const removedItem = await repository.remove(character.id, items[0].id);

    const allCharacterItems = await selectAll(db, 'charactersItems');

    expect(removedItem).toEqual(characterItems[0]);
    expect(allCharacterItems).toHaveLength(2);
  });
});
