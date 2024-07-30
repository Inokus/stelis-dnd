import { createTestDatabase } from '@server/tests/utils/database';
import { fakeItem } from '@server/tests/utils/fakes';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll, selectAll } from '@server/tests/utils/records';
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
      ...pick(item, itemKeysPublic),
      id: expect.any(Number),
    });
  });
});

describe('getByIds', () => {
  it('should get all items with matching ids', async () => {
    const items = await insertAll(db, 'items', [
      fakeItem({ name: 'Radiant Ring' }),
      fakeItem(),
      fakeItem({ name: 'Arcane Staff' }),
    ]);

    const matchingItems = await repository.getByIds([items[0].id, items[2].id]);

    expect(matchingItems).toHaveLength(2);
    expect(matchingItems).toEqual([items[2], items[0]]);
  });
});

describe('getAvailable', () => {
  it('should get all items', async () => {
    const items = await insertAll(db, 'items', [
      fakeItem(),
      fakeItem(),
      fakeItem(),
    ]);

    const allItems = await repository.getAvailable([items[0].id]);

    expect(allItems).toHaveLength(2);
  });
});

describe('update', () => {
  it('should update an item', async () => {
    const items = await insertAll(db, 'items', [fakeItem(), fakeItem()]);

    const updatedItem = await repository.update(items[0].id, {
      name: 'Radiant Ring',
      value: 1000,
    });

    expect(updatedItem).toEqual({
      ...pick(items[0], itemKeysPublic),
      name: 'Radiant Ring',
      value: 1000,
    });
  });
});

describe('remove', () => {
  it('should remove an item', async () => {
    const items = await insertAll(db, 'items', [fakeItem(), fakeItem()]);

    const removedItem = await repository.remove(items[0].id);

    const allItems = await selectAll(db, 'items');

    expect(removedItem).toEqual(items[0]);
    expect(allItems).toHaveLength(1);
  });
});
