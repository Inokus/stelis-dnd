import { createTestDatabase } from '@server/tests/utils/database';
import {
  fakeCharacterItem,
  fakeUser,
  fakeCampaign,
  fakeCharacter,
  fakeItem,
} from '@server/tests/utils/fakes';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll, selectAll } from '@server/tests/utils/records';
import { pick } from 'lodash-es';
import { characterItemKeysPublic } from '@server/entities/charactersItems';
import { charactersItemsRepository } from '../charactersItemsRepository';

const db = await wrapInRollbacks(createTestDatabase());
const repository = charactersItemsRepository(db);

describe('create', () => {
  it('should create a new character item', async () => {
    const [user] = await insertAll(db, 'users', fakeUser());
    const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
    const [character] = await insertAll(
      db,
      'characters',
      fakeCharacter({ userId: user.id, campaignId: campaign.id })
    );
    const [item] = await insertAll(db, 'items', fakeItem());
    const characterItem = fakeCharacterItem({
      characterId: character.id,
      itemId: item.id,
    });

    const createdCharacterItem = await repository.create(characterItem);

    expect(createdCharacterItem).toEqual({
      id: expect.any(Number),
      ...pick(characterItem, characterItemKeysPublic),
    });
  });
});

describe('getAll', () => {
  it('should get all character items', async () => {
    const [user] = await insertAll(db, 'users', fakeUser());
    const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
    const [character] = await insertAll(
      db,
      'characters',
      fakeCharacter({ userId: user.id, campaignId: campaign.id })
    );
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

    const allCharacterItems = await repository.getAll(character.id);

    expect(allCharacterItems).toHaveLength(3);
  });
});

describe('remove', () => {
  it('should remove an item', async () => {
    const [user] = await insertAll(db, 'users', fakeUser());
    const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
    const [character] = await insertAll(
      db,
      'characters',
      fakeCharacter({ userId: user.id, campaignId: campaign.id })
    );
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
