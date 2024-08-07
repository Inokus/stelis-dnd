import { createTestDatabase } from '@tests/utils/database';
import { fakeCampaign, fakeUser, fakeCharacter } from '@tests/utils/fakes';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/records';
import { pick } from 'lodash-es';
import { characterKeysPublic } from '@server/entities/characters';
import { charactersRepository } from '../charactersRepository';

const db = await wrapInRollbacks(createTestDatabase());
const repository = charactersRepository(db);

describe('create', () => {
  it('should create a new character', async () => {
    const [user] = await insertAll(db, 'users', fakeUser());
    const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
    const character = fakeCharacter({
      userId: user.id,
      campaignId: campaign.id,
    });

    const createdCharacter = await repository.create(character);

    expect(createdCharacter).toEqual({
      ...pick(character, characterKeysPublic),
      id: expect.any(Number),
      createdAt: expect.any(Date),
    });
  });
});

describe('getAvailable', () => {
  it('should get all campaign characters that belongs to user', async () => {
    const users = await insertAll(db, 'users', [fakeUser(), fakeUser()]);

    const campaigns = await insertAll(db, 'campaigns', [
      fakeCampaign(),
      fakeCampaign(),
    ]);

    const characters = await insertAll(db, 'characters', [
      fakeCharacter({
        name: 'Thia Galadon',
        userId: users[0].id,
        campaignId: campaigns[0].id,
      }),
      fakeCharacter({ userId: users[1].id, campaignId: campaigns[1].id }),
      fakeCharacter({
        name: 'Baern Stormwind',
        userId: users[0].id,
        campaignId: campaigns[1].id,
      }),
    ]);

    const availableCharacters = await repository.getAvailable(
      users[0].id,
      campaigns[0].id
    );

    expect(availableCharacters).toHaveLength(1);
    expect(availableCharacters).toEqual([
      {
        ...pick(characters[0], characterKeysPublic),
      },
    ]);
  });
});

describe('getAll', () => {
  it('should get all campaign characters', async () => {
    const users = await insertAll(db, 'users', [fakeUser(), fakeUser()]);

    const campaigns = await insertAll(db, 'campaigns', [
      fakeCampaign(),
      fakeCampaign(),
    ]);

    await insertAll(db, 'characters', [
      fakeCharacter({
        userId: users[0].id,
        campaignId: campaigns[0].id,
      }),
      fakeCharacter({ userId: users[1].id, campaignId: campaigns[1].id }),
      fakeCharacter({
        userId: users[0].id,
        campaignId: campaigns[1].id,
      }),
    ]);

    const allCharacters = await repository.getAll(campaigns[1].id);

    expect(allCharacters).toHaveLength(2);
  });
});
