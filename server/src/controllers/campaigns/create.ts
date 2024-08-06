import { campaignSchema } from '@server/entities/campaigns';
import { adminProcedure } from '@server/trpc/adminProcedure';
import { TRPCError } from '@trpc/server';
import provideRepos from '@server/trpc/provideRepos';
import { campaignsRepository } from '@server/repositories/campaignsRepository';
import { assertError } from '@server/utils/errors';

export default adminProcedure
  .use(provideRepos({ campaignsRepository }))

  .input(
    campaignSchema.pick({
      name: true,
    })
  )
  .mutation(async ({ input: campaignData, ctx: { repos } }) => {
    try {
      const campaignCreated =
        await repos.campaignsRepository.create(campaignData);

      return campaignCreated;
    } catch (error: unknown) {
      assertError(error);

      if (error.message.includes('campaigns_name_key')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Campaign with this name already exists.',
          cause: error,
        });
      }

      throw error;
    }
  });
