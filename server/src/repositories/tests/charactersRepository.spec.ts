import { createTestDatabase } from '@server/tests/utils/database';
import {
  fakeCampaign,
  fakeUser,
  fakeCharacter,
} from '@server/tests/utils/fakes';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll } from '@server/tests/utils/records';
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
      id: expect.any(Number),
      ...pick(character, characterKeysPublic),
      createdAt: expect.any(Date),
    });
  });
});

describe('getAvailable', () => {
  it('should get all campaign characters that belongs to user', async () => {
    const [userOne, userTwo] = await insertAll(db, 'users', [
      fakeUser(),
      fakeUser(),
    ]);

    const [campaignOne, campaignTwo] = await insertAll(db, 'campaigns', [
      fakeCampaign(),
      fakeCampaign(),
    ]);

    const [characterOne, ..._] = await insertAll(db, 'characters', [
      fakeCharacter({
        name: 'Thia Galadon',
        userId: userOne.id,
        campaignId: campaignOne.id,
      }),
      fakeCharacter({ userId: userTwo.id, campaignId: campaignTwo.id }),
      fakeCharacter({
        name: 'Baern Stormwind',
        userId: userOne.id,
        campaignId: campaignTwo.id,
      }),
    ]);

    const availableCharacters = await repository.getAvailable(
      userOne.id,
      campaignOne.id
    );

    expect(availableCharacters).toHaveLength(1);
    expect(availableCharacters).toEqual([
      {
        ...pick(characterOne, characterKeysPublic),
      },
    ]);
  });
});

describe('getAll', () => {
  it('should get all campaign characters', async () => {
    const [userOne, userTwo] = await insertAll(db, 'users', [
      fakeUser(),
      fakeUser(),
    ]);

    const [campaignOne, campaignTwo] = await insertAll(db, 'campaigns', [
      fakeCampaign(),
      fakeCampaign(),
    ]);

    await insertAll(db, 'characters', [
      fakeCharacter({
        userId: userOne.id,
        campaignId: campaignOne.id,
      }),
      fakeCharacter({ userId: userTwo.id, campaignId: campaignTwo.id }),
      fakeCharacter({
        userId: userOne.id,
        campaignId: campaignTwo.id,
      }),
    ]);

    const allCharacters = await repository.getAll(campaignTwo.id);

    expect(allCharacters).toHaveLength(2);
  });
});
