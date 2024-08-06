import type { Database } from '@server/database';
import { middleware } from '..';

export default function withTransaction() {
  return middleware(async ({ ctx, next }) => {
    const { db } = ctx as { db: Database };

    return db.transaction().execute(async (trx) =>
      next({
        ctx: {
          ...ctx,
          db: trx,
        },
      })
    );
  });
}
