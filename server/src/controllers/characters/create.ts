import { characterSchema } from '@server/entities/characters';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { TRPCError } from '@trpc/server';
import provideRepos from '@server/trpc/provideRepos';
import { charactersRepository } from '@server/repositories/charactersRepository';
import { campaignsRepository } from '@server/repositories/campaignsRepository';

export default authenticatedProcedure
  .use(provideRepos({ charactersRepository, campaignsRepository }))

  .input(
    characterSchema.pick({
      name: true,
      userId: true,
      campaignId: true,
    })
  )
  .mutation(async ({ input: characterData, ctx: { repos, authUser } }) => {
    if (!authUser.isAdmin) {
      const userCampaigns = await repos.campaignsRepository.getAvailable(
        characterData.userId
      );

      if (
        !userCampaigns.some(
          (campaign) => campaign.id === characterData.campaignId
        )
      ) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Access denied.',
        });
      }
    }

    const characterCreated =
      await repos.charactersRepository.create(characterData);

    return characterCreated;
  });
