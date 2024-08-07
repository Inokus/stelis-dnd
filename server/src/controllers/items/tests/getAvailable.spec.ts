import { authContext, requestContext } from '@tests/utils/context';
import { fakeCampaign, fakeItem, fakeRestrictedItem } from '@tests/utils/fakes';
import { createTestDatabase } from '@tests/utils/database';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/records';
import itemsRouter from '..';

const createCaller = createCallerFactory(itemsRouter);
const db = await wrapInRollbacks(createTestDatabase());

it('should throw an error if user is not authenticated', async () => {
  const { getAvailable } = createCaller(requestContext({ db }));
  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

  await expect(getAvailable(campaign.id)).rejects.toThrow(/unauthenticated/i);
});

it('should return an empty list, if there are no items', async () => {
  const { getAvailable } = createCaller(authContext({ db }));
  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

  expect(await getAvailable(campaign.id)).toHaveLength(0);
});

it('should return a list of available items', async () => {
  const { getAvailable } = createCaller(authContext({ db }));
  const campaigns = await insertAll(db, 'campaigns', [
    fakeCampaign(),
    fakeCampaign(),
  ]);

  const items = await insertAll(db, 'items', [
    fakeItem(),
    fakeItem(),
    fakeItem(),
  ]);

  await insertAll(
    db,
    'restrictedItems',
    fakeRestrictedItem({ campaignId: campaigns[1].id, itemId: items[0].id })
  );

  const availableItems = await getAvailable(campaigns[0].id);

  expect(availableItems).toHaveLength(2);
});

it('should return items in alphabetical order', async () => {
  const { getAvailable } = createCaller(authContext({ db }));
  const [campaign] = await insertAll(db, 'campaigns', fakeCampaign());

  const items = await insertAll(db, 'items', [
    fakeItem({ name: 'Cursed Sword' }),
    fakeItem({ name: 'Arcane Staff' }),
  ]);

  const availableItems = await getAvailable(campaign.id);

  expect(availableItems[0]).toMatchObject(items[1]);
  expect(availableItems[1]).toMatchObject(items[0]);
});
