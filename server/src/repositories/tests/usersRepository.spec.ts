import { createTestDatabase } from '@tests/utils/database';
import { fakeUser } from '@tests/utils/fakes';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { insertAll } from '@tests/utils/records';
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
      ...pick(user, userKeysPublic),
      id: expect.any(Number),
      isAdmin: false,
      createdAt: expect.any(Date),
    });
  });
});

describe('findByUsername', () => {
  it('should find user by username', async () => {
    const users = await insertAll(db, 'users', [
      fakeUser({ username: 'bob' }),
      fakeUser(),
    ]);

    const foundUser = await repository.findByUsername('bob');

    expect(foundUser).toEqual(users[0]);
  });
});
