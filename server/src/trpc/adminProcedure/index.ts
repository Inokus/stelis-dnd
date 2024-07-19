import { TRPCError } from '@trpc/server';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';

export const adminProcedure = authenticatedProcedure.use(({ ctx, next }) => {
  if (!ctx.authUser.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied.',
    });
  }

  return next({
    ctx: {
      ...ctx,
    },
  });
});
