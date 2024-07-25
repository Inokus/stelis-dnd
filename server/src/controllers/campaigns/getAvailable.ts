import { campaignsRepository } from '@server/repositories/campaignsRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';

export default authenticatedProcedure
  .use(
    provideRepos({
      campaignsRepository,
    })
  )
  .query(async ({ ctx: { repos, authUser } }) => {
    if (!authUser.isAdmin) {
      return await repos.campaignsRepository.getAvailable(authUser.id);
    }
    return await repos.campaignsRepository.getAll();
  });
