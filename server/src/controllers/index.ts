import { router } from '@server/trpc';
import users from './users';

export const appRouter = router({
  users,
});

export type AppRouter = typeof appRouter;
