import { createTestDatabase } from '@server/tests/utils/database';
import { fakeUser } from '@server/tests/utils/fakes';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { insertAll, selectAll } from '@server/tests/utils/records';
import { pick } from 'lodash-es';
import { userKeysPublic } from '@server/entities/users';
import { usersRepository } from '../usersRepository';

const db = await wrapInRollbacks(createTestDatabase());
const repository = usersRepository(db);

describe('create', () => {
  it('should create a new user', async () => {
    const user = fakeUser();

    const createdUser = await repository.create(user);

    expect(createdUser).toEqual({
      id: expect.any(Number),
      ...pick(user, userKeysPublic),
      isAdmin: false,
      createdAt: expect.any(Date),
    });
  });
});

describe('findByUsername', () => {
  it('should find user by username', async () => {
    const users = await insertAll(db, 'users', [
      fakeUser({ username: 'testUsername' }),
      fakeUser(),
    ]);

    const foundUser = await repository.findByUsername('testUsername');

    expect(foundUser).toEqual(users[0]);
  });
});
