import { createTestDatabase } from '@tests/utils/database';
import {
  fakeDowntime,
  fakeUser,
  fakeCampaign,
  fakeCharacter,
} from '@tests/utils/fakes';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/records';
import { pick } from 'lodash-es';
import { downtimeKeysPublic } from '@server/entities/downtimes';
import { downtimesRepository } from '../downtimesRepository';

const db = await wrapInRollbacks(createTestDatabase());
const repository = downtimesRepository(db);

const [user] = await insertAll(db, 'users', fakeUser());
const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
const [character] = await insertAll(
  db,
  'characters',
  fakeCharacter({ userId: user.id, campaignId: campaign.id })
);

describe('create', () => {
  it('should create a new downtime', async () => {
    const downtime = fakeDowntime({
      characterId: character.id,
    });

    const createdDowntime = await repository.create(downtime);

    expect(createdDowntime).toEqual({
      ...pick(downtime, downtimeKeysPublic),
      id: expect.any(Number),
      createdAt: expect.any(Date),
    });
  });
});

describe('getAll', () => {
  it('should get all character downtimes', async () => {
    await insertAll(db, 'downtimes', [
      fakeDowntime({ characterId: character.id }),
      fakeDowntime({ characterId: character.id }),
      fakeDowntime({ characterId: character.id }),
    ]);

    const allDowntimes = await repository.getAll(character.id);

    expect(allDowntimes).toHaveLength(3);
  });
});
