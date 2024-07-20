import { router } from '@server/trpc';
import users from './users';
import campaigns from './campaigns';

export const appRouter = router({
  users,
  campaigns,
});

export type AppRouter = typeof appRouter;
