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
      const campaigns = await repos.campaignsRepository.getAvailable(
        authUser.id
      );

      return campaigns;
    }

    const campaigns = await repos.campaignsRepository.getAll();

    return campaigns;
  });
