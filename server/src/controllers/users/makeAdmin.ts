import { usersRepository } from '@server/repositories/usersRepository';
import { publicProcedure } from '@server/trpc';
import { TRPCError } from '@trpc/server';
import { assertError } from '@server/utils/errors';
import { idSchema } from '@server/entities/shared';
import provideRepos from '@server/trpc/provideRepos';

export default publicProcedure
  .use(
    provideRepos({
      usersRepository,
    })
  )
  .input(idSchema)
  .mutation(async ({ input: userId, ctx: { repos } }) => {
    // Only allow this mutation in the test environment
    if (
      process.env.NODE_ENV !== 'test' &&
      process.env.NODE_ENV !== 'development'
    ) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'This operation is only allowed in the test or development environments.',
      });
    }

    try {
      const characterUpdated = await repos.usersRepository.makeAdmin(userId);

      return characterUpdated;
    } catch (error: unknown) {
      assertError(error);

      throw error;
    }
  });
