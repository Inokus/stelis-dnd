import { characterSchema } from '@server/entities/characters';
import { idSchema } from '@server/entities/shared';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { TRPCError } from '@trpc/server';
import provideRepos from '@server/trpc/provideRepos';
import { charactersRepository } from '@server/repositories/charactersRepository';
import { campaignsRepository } from '@server/repositories/campaignsRepository';
import { z } from 'zod';

export default authenticatedProcedure
  .use(provideRepos({ charactersRepository, campaignsRepository }))

  .input(
    z.object({
      characterData: characterSchema.pick({
        name: true,
        campaignId: true,
      }),
      userId: idSchema.optional(),
    })
  )
  .mutation(
    async ({ input: { characterData, userId }, ctx: { repos, authUser } }) => {
      const finalUserId = authUser.isAdmin && userId ? userId : authUser.id;

      // if user is not admin check if they have at least one character in that campaign already
      if (!authUser.isAdmin) {
        const campaigns =
          await repos.campaignsRepository.getAvailable(finalUserId);

        if (
          !campaigns.some(
            (campaign) => campaign.id === characterData.campaignId
          )
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied.',
          });
        } else {
          const characterCreated = await repos.charactersRepository.create({
            ...characterData,
            userId: finalUserId,
          });

          return characterCreated;
        }
      } else {
        const characterCreated = await repos.charactersRepository.create({
          ...characterData,
          userId: finalUserId,
        });

        return characterCreated;
      }
    }
  );
