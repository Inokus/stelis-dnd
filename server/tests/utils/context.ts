import { fakeAuthUser, fakeAdminUser } from '@tests/utils/fakes';
import { authUserSchema, type AuthUser } from '@server/entities/users';
import type { Context, ContextMinimal } from '@server/trpc';

export const requestContext = (
  context: Partial<Context> & ContextMinimal
): Context => ({
  req: {
    header: () => undefined,
    get: () => undefined,
  } as any,
  res: {
    cookie: () => undefined,
  } as any,
  ...context,
});

export const authContext = (
  context: Partial<Context> & ContextMinimal,
  user: AuthUser = fakeAuthUser()
): Context => ({
  authUser: authUserSchema.parse(user),
  ...context,
});

export const authRepoContext = (
  repos: any, // Context['repos'], but easier to work with any in tests
  user: AuthUser = fakeAuthUser()
): Context => ({
  authUser: authUserSchema.parse(user),
  ...requestContext({
    db: {} as any,
    repos,
  }),
});

export const adminContext = (
  context: Partial<Context> & ContextMinimal,
  user: AuthUser = fakeAdminUser()
): Context => ({
  authUser: authUserSchema.parse(user),
  ...context,
});
