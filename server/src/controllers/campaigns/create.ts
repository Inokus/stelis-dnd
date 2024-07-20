import { campaignSchema } from '@server/entities/campaigns';
import { adminProcedure } from '@server/trpc/adminProcedure';
import provideRepos from '@server/trpc/provideRepos';
import { campaignsRepository } from '@server/repositories/campaignsRepository';

export default adminProcedure
  .use(provideRepos({ campaignsRepository }))

  .input(
    campaignSchema.pick({
      name: true,
    })
  )
  .mutation(async ({ input: campaignData, ctx: { repos } }) => {
    const campaignCreated =
      await repos.campaignsRepository.create(campaignData);

    return campaignCreated;
  });
