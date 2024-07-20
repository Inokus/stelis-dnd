import { charactersRepository } from '@server/repositories/charactersRepository';
import { adminProcedure } from '@server/trpc/adminProcedure';
import provideRepos from '@server/trpc/provideRepos';

export default adminProcedure
  .use(
    provideRepos({
      charactersRepository,
    })
  )
  .query(async ({ ctx: { repos } }) => {
    const campaigns = await repos.charactersRepository.getAll();

    return campaigns;
  });
