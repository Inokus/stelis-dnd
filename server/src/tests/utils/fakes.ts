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
import { random } from './random';
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
