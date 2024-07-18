import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@server/tests/utils/transactions';
import { createTestDatabase } from '@server/tests/utils/database';
import { insertAll } from '@server/tests/utils/records';
import { fakeUser } from '@server/tests/utils/fakes';
import userRouter from '..';

const createCaller = createCallerFactory(userRouter);
const db = await wrapInRollbacks(createTestDatabase());
const PASSWORD_CORRECT = 'password.123';

const [userSeed] = await insertAll(db, 'users', [
  fakeUser({
    username: 'existinguser',
    password: '$2b$10$sD53fzWIQBjXWfSDzuwmMOyY1ZAygLpRZlLxxPhcNG5r9BFWrNaDC',
  }),
]);

const { login } = createCaller({ db } as any);

it('returns a token if the password matches', async () => {
  const { accessToken } = await login({
    username: userSeed.username,
    password: PASSWORD_CORRECT,
  });

  // jwt
  expect(accessToken).toEqual(expect.any(String));
  expect(accessToken.slice(0, 3)).toEqual('eyJ');
});

it('should throw an error for non-existant user', async () => {
  await expect(
    login({
      username: 'nonexistinguser',
      password: PASSWORD_CORRECT,
    })
  ).rejects.toThrow(); // some error
});

it('should throw an error for incorrect password', async () => {
  expect(
    login({
      username: userSeed.username,
      password: 'password.123!',
    })
  ).rejects.toThrow(/password/i);
});

it('allows logging in with different username case', async () => {
  await expect(
    login({
      username: userSeed.username.toUpperCase(),
      password: PASSWORD_CORRECT,
    })
  ).resolves.toEqual(expect.anything());
});

it('allows logging in with surrounding white space', async () => {
  await expect(
    login({
      username: ` \t ${userSeed.username}\t `, // tabs and spaces
      password: PASSWORD_CORRECT,
    })
  ).resolves.toEqual(expect.anything());
});
