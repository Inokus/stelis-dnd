import { createTestDatabase } from '@server/tests/utils/database';
import {
  fakeItem,
  fakeCampaign,
  fakeRestrictedItem,
} from '@server/tests/utils/fakes';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll, selectAll } from '@server/tests/utils/records';
import { pick } from 'lodash-es';
import { restrictedItemKeysPublic } from '@server/entities/restrictedItems';
import { restrictedItemsRepository } from '../restrictedItemsRepository';

const db = await wrapInRollbacks(createTestDatabase());
const repository = restrictedItemsRepository(db);

describe('create', () => {
  it('should create a new restricted item', async () => {
    const [item] = await insertAll(db, 'items', fakeItem());
    const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());
    const restrictedItem = fakeRestrictedItem({
      itemId: item.id,
      campaignId: campaign.id,
    });

    const createdRestrictedItem = await repository.create(restrictedItem);

    expect(createdRestrictedItem).toEqual({
      id: expect.any(Number),
      ...pick(restrictedItem, restrictedItemKeysPublic),
    });
  });
});

describe('getAll', () => {
  it('should get all restricted items for campaign', async () => {
    const [itemOne, itemTwo] = await insertAll(db, 'items', [
      fakeItem(),
      fakeItem(),
    ]);

    const [campaignOne, campaignTwo] = await insertAll(db, 'campaigns', [
      fakeCampaign(),
      fakeCampaign(),
    ]);

    const restrictedItems = await insertAll(db, 'restrictedItems', [
      fakeRestrictedItem({ itemId: itemOne.id, campaignId: campaignOne.id }),
      fakeRestrictedItem({
        itemId: itemTwo.id,
        campaignId: campaignTwo.id,
      }),
    ]);

    const allRestrictedItems = await repository.getAll(campaignOne.id);

    expect(allRestrictedItems).toHaveLength(1);
    expect(allRestrictedItems[0]).toEqual(restrictedItems[1]);
  });
});

describe('remove', () => {
  it('should remove an restricted item', async () => {
    const items = await insertAll(db, 'items', [fakeItem(), fakeItem()]);
    const campaigns = await insertAll(db, 'campaigns', [
      fakeCampaign(),
      fakeCampaign(),
    ]);
    const restrictedItems = await insertAll(db, 'restrictedItems', [
      fakeRestrictedItem({ itemId: items[0].id, campaignId: campaigns[0].id }),
      fakeRestrictedItem({ itemId: items[1].id, campaignId: campaigns[1].id }),
    ]);

    const removedItem = await repository.remove({
      itemId: items[0].id,
      campaignId: campaigns[0].id,
    });

    const allItems = await selectAll(db, 'restrictedItems');

    expect(removedItem).toEqual(restrictedItems[0]);
    expect(allItems).toHaveLength(1);
  });
});
