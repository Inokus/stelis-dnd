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
    const campaigns = await repos.campaignsRepository.getAvailable(authUser.id);

    return campaigns;
  });
