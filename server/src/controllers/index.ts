import { router } from '@server/trpc';
import users from './users';
import campaigns from './campaigns';
import characters from './characters';

export const appRouter = router({
  users,
  campaigns,
  characters,
});

export type AppRouter = typeof appRouter;
