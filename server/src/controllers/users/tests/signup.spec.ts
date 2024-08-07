import { createTestDatabase } from '@tests/utils/database';
import { fakeUser } from '@tests/utils/fakes';
import { createCallerFactory } from '@server/trpc';
import { wrapInRollbacks } from '@tests/utils/transactions';
import { selectAll } from '@tests/utils/records';
import { random } from '@tests/utils/random';
import userRouter from '..';

const db = await wrapInRollbacks(createTestDatabase());
const createCaller = createCallerFactory(userRouter);
const { signup } = createCaller({ db });

it('should save a user', async () => {
  const user = fakeUser();
  const response = await signup(user);

  const [userCreated] = await selectAll(db, 'users', (eb) =>
    eb('username', '=', user.username)
  );

  expect(userCreated).toMatchObject({
    id: expect.any(Number),
    ...user,
    password: expect.not.stringContaining(user.password),
  });

  expect(userCreated.password).toHaveLength(60);

  expect(response).toEqual({
    id: userCreated.id,
  });
});

it('should require a username with at least 3 characters', async () => {
  await expect(
    signup(
      fakeUser({
        username: 'bo',
      })
    )
  ).rejects.toThrow(/username/i); // throws out some error complaining about "username"
});

it('should require a username without special characters', async () => {
  await expect(
    signup(
      fakeUser({
        username: '#bo',
      })
    )
  ).rejects.toThrow(/username/i); // throws out some error complaining about "username"
});

it('should require a valid email', async () => {
  await expect(
    signup(
      fakeUser({
        email: 'user-email-invalid',
      })
    )
  ).rejects.toThrow(/email/i); // throws out some error complaining about "email"
});

it('should require a password with at least 8 characters', async () => {
  await expect(
    signup(
      fakeUser({
        password: 'pas.123',
      })
    )
  ).rejects.toThrow(/password/i); // throws out some error complaining about "password"
});

it('throws an error for invalid email', async () => {
  await expect(
    signup(
      fakeUser({
        email: 'not-an-email',
      })
    )
  ).rejects.toThrow(/email/);
});

it('stores lowercased username', async () => {
  const user = fakeUser();

  await signup({
    ...user,
    username: user.username.toUpperCase(),
  });

  // get user with original lowercase username
  const userSaved = await selectAll(db, 'users', (eb) =>
    eb('username', '=', user.username)
  );

  expect(userSaved).toHaveLength(1);
});

it('stores lowercased email', async () => {
  const user = fakeUser();

  await signup({
    ...user,
    email: user.email.toUpperCase(),
  });

  // get user with original lowercase email
  const userSaved = await selectAll(db, 'users', (eb) =>
    eb('email', '=', user.email)
  );

  expect(userSaved).toHaveLength(1);
});

it('stores email with trimmed whitespace', async () => {
  const user = fakeUser();
  await signup({
    ...user,
    email: ` \t ${user.email}\t `, // tabs and spaces
  });

  const userSaved = await selectAll(db, 'users', (eb) =>
    eb('email', '=', user.email)
  );

  expect(userSaved).toHaveLength(1);
});

it('throws an error for duplicate username', async () => {
  const username = random.first();

  // signup once
  await signup(fakeUser({ username }));

  // expect that the second signup will throw an error
  await expect(signup(fakeUser({ username }))).rejects.toThrow(
    /username already exists/i
  );
});

it('throws an error for duplicate email', async () => {
  const email = random.email();

  // signup once
  await signup(fakeUser({ email }));

  // expect that the second signup will throw an error
  await expect(signup(fakeUser({ email }))).rejects.toThrow(
    /email already exists/i
  );
});
