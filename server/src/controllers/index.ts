import { router } from '@server/trpc';
import users from './users';
import campaigns from './campaigns';
import characters from './characters';
import items from './items';

export const appRouter = router({
  users,
  campaigns,
  characters,
  items,
});

export type AppRouter = typeof appRouter;
