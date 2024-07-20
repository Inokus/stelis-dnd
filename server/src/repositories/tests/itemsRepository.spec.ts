import { createTestDatabase } from '@server/tests/utils/database';
import { fakeItem } from '@server/tests/utils/fakes';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll } from '@server/tests/utils/records';
import { pick } from 'lodash-es';
import { itemKeysPublic } from '@server/entities/items';
import { itemsRepository } from '../itemsRepository';

const db = await wrapInRollbacks(createTestDatabase());
const repository = itemsRepository(db);

describe('create', () => {
  it('should create a new item', async () => {
    const item = fakeItem();

    const createdItem = await repository.create(item);

    expect(createdItem).toEqual({
      id: expect.any(Number),
      ...pick(item, itemKeysPublic),
      isCurrency: false,
    });
  });
});

describe('getAll', () => {
  it('should get all items', async () => {
    await insertAll(db, 'items', [fakeItem(), fakeItem(), fakeItem()]);

    const allItems = await repository.getAll();

    expect(allItems).toHaveLength(3);
  });
});
