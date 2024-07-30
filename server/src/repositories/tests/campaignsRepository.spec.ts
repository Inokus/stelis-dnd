import { createTestDatabase } from '@server/tests/utils/database';
import {
  fakeCampaign,
  fakeUser,
  fakeCharacter,
} from '@server/tests/utils/fakes';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll } from '@server/tests/utils/records';
import { pick } from 'lodash-es';
import { campaignKeysPublic } from '@server/entities/campaigns';
import { campaignsRepository } from '../campaignsRepository';

const db = await wrapInRollbacks(createTestDatabase());
const repository = campaignsRepository(db);

describe('create', () => {
  it('should create a new campaign', async () => {
    const campaign = fakeCampaign();

    const createdCampaign = await repository.create(campaign);

    expect(createdCampaign).toEqual({
      ...pick(campaign, campaignKeysPublic),
      id: expect.any(Number),
      createdAt: expect.any(Date),
    });
  });
});

describe('getAvailable', () => {
  it('should get all campaigns that user has characters in', async () => {
    const users = await insertAll(db, 'users', [fakeUser(), fakeUser()]);

    const campaigns = await insertAll(db, 'campaigns', [
      fakeCampaign({ name: 'Epic Quest of the Dragon' }),
      fakeCampaign(),
      fakeCampaign({ name: 'Lost Legend of the Ancients' }),
    ]);

    await insertAll(db, 'characters', [
      fakeCharacter({ userId: users[0].id, campaignId: campaigns[0].id }),
      fakeCharacter({ userId: users[1].id, campaignId: campaigns[1].id }),
      fakeCharacter({ userId: users[0].id, campaignId: campaigns[2].id }),
    ]);

    const availableCampaigns = await repository.getAvailable(users[0].id);

    expect(availableCampaigns).toHaveLength(2);
    expect(availableCampaigns).toEqual([
      {
        ...pick(campaigns[0], campaignKeysPublic),
      },
      {
        ...pick(campaigns[2], campaignKeysPublic),
      },
    ]);
  });
});

describe('getAll', () => {
  it('should get all campaigns', async () => {
    await insertAll(db, 'campaigns', [
      fakeCampaign(),
      fakeCampaign(),
      fakeCampaign(),
    ]);

    const allCampaigns = await repository.getAll();

    expect(allCampaigns).toHaveLength(3);
  });
});
