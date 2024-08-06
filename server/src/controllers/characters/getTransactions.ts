import { idSchema } from '@server/entities/shared';
import { transactionsRepository } from '@server/repositories/transactionsRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';

export default authenticatedProcedure
  .use(
    provideRepos({
      transactionsRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: characterId, ctx: { repos } }) => {
    const transactions = await repos.transactionsRepository.getAll(characterId);

    return transactions;
  });
