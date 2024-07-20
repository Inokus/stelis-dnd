import { campaignsRepository } from '@server/repositories/campaignsRepository';
import { adminProcedure } from '@server/trpc/adminProcedure';
import provideRepos from '@server/trpc/provideRepos';

export default adminProcedure
  .use(
    provideRepos({
      campaignsRepository,
    })
  )
  .query(async ({ ctx: { repos } }) => {
    const campaigns = await repos.campaignsRepository.getAll();

    return campaigns;
  });
