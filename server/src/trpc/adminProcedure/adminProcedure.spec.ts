import { authContext } from '@tests/utils/context';
import { createCallerFactory, router } from '..';
import { adminProcedure } from '.';

const routes = router({
  testCall: adminProcedure.query(() => 'passed'),
});

const createCaller = createCallerFactory(routes);

const VALID_ADMIN_TOKEN = 'valid-admin-token';
const VALID_NON_ADMIN_TOKEN = 'valid-non-admin-token';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: (token: string) => {
      if (token === VALID_ADMIN_TOKEN) {
        return { user: { id: 1, isAdmin: true } };
      }

      if (token === VALID_NON_ADMIN_TOKEN) {
        return { user: { id: 2, isAdmin: false } };
      }

      throw new Error('Invalid token.');
    },
  },
}));

const db = {} as any;

const adminAuthenticated = createCaller(
  authContext({ db, authUser: { id: 1, isAdmin: true } })
);
const nonAdminAuthenticated = createCaller(
  authContext({ db, authUser: { id: 1, isAdmin: false } })
);

it('should pass if user is authenticated admin', async () => {
  const response = await adminAuthenticated.testCall();

  expect(response).toEqual('passed');
});

it('should pass if user provides a valid admin token', async () => {
  const usingValidAdminToken = createCaller({
    db,
    req: {
      header: () => `Bearer ${VALID_ADMIN_TOKEN}`,
    } as any,
  });

  const response = await usingValidAdminToken.testCall();

  expect(response).toEqual('passed');
});

it('should throw an error if user is not an admin', async () => {
  await expect(nonAdminAuthenticated.testCall()).rejects.toThrow(/denied/i);
});

it('should throw an error if user provides a valid non-admin token', async () => {
  const usingValidNonAdminToken = createCaller({
    db,
    req: {
      header: () => `Bearer ${VALID_NON_ADMIN_TOKEN}`,
    } as any,
  });

  await expect(usingValidNonAdminToken.testCall()).rejects.toThrow(/denied/i);
});
