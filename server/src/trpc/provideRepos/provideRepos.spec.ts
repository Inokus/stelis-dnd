import { z } from 'zod';
import { createCallerFactory, publicProcedure, router } from '..';
import provideRepos from '.';

const db = {} as any;
const usersRepositoryBuilder = vi.fn(() => {}) as any;

const routes = router({
  testCall: publicProcedure
    .use(provideRepos({ usersRepository: usersRepositoryBuilder }))
    .input(z.object({}))
    .query(() => 'ok'),
});

afterEach(() => {
  vi.resetAllMocks();
});

it('provides repos', async () => {
  const ctx = {
    db,
  };

  const caller = createCallerFactory(routes);
  const { testCall } = caller(ctx as any);

  expect(await testCall({})).toEqual('ok');
  expect(usersRepositoryBuilder).toHaveBeenCalledWith(db);
});

it('skips providing repos if they are already in context', async () => {
  const ctx = {
    db,
    repos: {
      usersRepository: {},
    },
  };

  const caller = createCallerFactory(routes);
  const { testCall } = caller(ctx as any);

  expect(await testCall({})).toEqual('ok');
  expect(usersRepositoryBuilder).not.toHaveBeenCalled();
});
