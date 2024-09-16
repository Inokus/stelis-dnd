import type { Campaigns, Characters, Downtimes, Items, Users } from '@server/shared/types';
import type { Insertable } from 'kysely';
import { Chance } from 'chance';

export const random = process.env.CI ? Chance(1) : Chance();

const getValidFirstName = (minLength = 3) => {
  let name = '';
  do {
    name = random.first();
  } while (name.length < minLength);
  return name;
};

const getValidWord = (minLength = 3) => {
  let name = '';
  do {
    name = random.word();
  } while (name.length < minLength);
  return name;
};

export const fakeUser = <T extends Partial<Insertable<Users>>>(overrides: T = {} as T) =>
  ({
    username: getValidFirstName(),
    email: random.email(),
    password: 'Password.123!',
    ...overrides,
  }) satisfies Insertable<Users>;

export const fakeCampaign = <T extends Partial<Insertable<Campaigns>>>(overrides: T = {} as T) => ({
  name: getValidWord(),
  ...overrides,
});

export const fakeCharacter = <T extends Partial<Insertable<Characters>>>(
  overrides: T = {} as T
) => ({
  name: getValidFirstName(),
  ...overrides,
});

export const fakeDowntime = <T extends Partial<Insertable<Downtimes>>>(overrides: T = {} as T) => ({
  days: random.integer({ min: 1, max: 20 }),
  description: random.sentence({ words: 5 }),
  ...overrides,
});

export const fakeItem = <T extends Partial<Insertable<Items>>>(overrides: T = {} as T) => ({
  name: random.word(),
  description: random.sentence({ words: 5 }),
  value: random.integer({ min: 1, max: 20 }).toString(),
  ...overrides,
});
