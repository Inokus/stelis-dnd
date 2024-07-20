import type {
  Campaigns,
  Characters,
  CharactersItems,
  Downtimes,
  Items,
  RestrictedItems,
  Transactions,
  Users,
} from '@server/database/types';
import type { Insertable } from 'kysely';
import {
  random,
  generateCampaignName,
  generateCharacterName,
  generateItemName,
} from './random';
import type { AuthUser } from '@server/entities/users';

const randomId = () =>
  random.integer({
    min: 1,
    max: 1000000,
  });

/**
 * Generates a fake user with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeUser = <T extends Partial<Insertable<Users>>>(
  overrides: T = {} as T
) =>
  ({
    email: random.email().trim().toLowerCase(),
    password: 'Password.123!',
    username: random.first().trim().toLowerCase(),
    ...overrides,
  }) satisfies Insertable<Users>;

export const fakeAuthUser = <T extends Partial<AuthUser>>(
  overrides: T = {} as T
): AuthUser => ({
  id: randomId(),
  isAdmin: false,
  ...overrides,
});

export const fakeAdminUser = <T extends Partial<AuthUser>>(
  overrides: T = {} as T
): AuthUser => ({
  id: randomId(),
  isAdmin: true,
  ...overrides,
});

/**
 * Generates a fake campaign with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeCampaign = <T extends Partial<Insertable<Campaigns>>>(
  overrides: T = {} as T
) =>
  ({
    name: generateCampaignName(),
    ...overrides,
  }) satisfies Insertable<Campaigns>;

/**
 * Generates a fake character with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeCharacter = <T extends Partial<Insertable<Characters>>>(
  overrides: T = {} as T
) =>
  ({
    name: generateCharacterName(),
    downtime: random.integer({ min: 1, max: 60 }),
    userId: randomId(),
    campaignId: randomId(),
    ...overrides,
  }) satisfies Insertable<Characters>;

/**
 * Generates a fake character item with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeCharacterItem = <
  T extends Partial<Insertable<CharactersItems>>,
>(
  overrides: T = {} as T
) =>
  ({
    quantity: random.integer({ min: 1, max: 60 }),
    characterId: randomId(),
    itemId: randomId(),
    ...overrides,
  }) satisfies Insertable<CharactersItems>;

/**
 * Generates a downtime with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeDowntime = <T extends Partial<Insertable<Downtimes>>>(
  overrides: T = {} as T
) =>
  ({
    // THIS AINT RIGHT
    // Perhaps change into list and pick one
    type: random.string(),
    days: random.integer({ min: 1, max: 60 }),
    description: random.paragraph(),
    characterId: randomId(),
    ...overrides,
  }) satisfies Insertable<Downtimes>;

/**
 * Generates a fake item with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeItem = <T extends Partial<Insertable<Items>>>(
  overrides: T = {} as T
) =>
  ({
    name: generateItemName(),
    description: random.paragraph(),
    value: random.integer({ min: 1, max: 5000 }),
    isCurrency: false,
    ...overrides,
  }) satisfies Insertable<Items>;

/**
 * Generates a fake restricted item with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeRestrictedItem = <
  T extends Partial<Insertable<RestrictedItems>>,
>(
  overrides: T = {} as T
) =>
  ({
    itemId: randomId(),
    campaignId: randomId(),
    ...overrides,
  }) satisfies Insertable<RestrictedItems>;

/**
 * Generates a fake transaction with some default test data.
 * @param overrides Any properties that should be different from default fake data.
 */
export const fakeTransaction = <T extends Partial<Insertable<Transactions>>>(
  overrides: T = {} as T
) =>
  ({
    // THIS AINT RIGHT
    // Perhaps change into list and pick one
    type: random.string(),
    quantity: random.integer({ min: 1, max: 60 }),
    value: random.integer({ min: 1, max: 5000 }),
    characterId: randomId(),
    itemId: randomId(),
    ...overrides,
  }) satisfies Insertable<Transactions>;
