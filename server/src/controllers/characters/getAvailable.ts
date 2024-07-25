import { idSchema } from '@server/entities/shared';
import { charactersRepository } from '@server/repositories/charactersRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';

export default authenticatedProcedure
  .use(
    provideRepos({
      charactersRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: campaignId, ctx: { repos, authUser } }) => {
    if (!authUser.isAdmin) {
      return await repos.charactersRepository.getAvailable(
        authUser.id,
        campaignId
      );
    }
    return await repos.charactersRepository.getAll(campaignId);
  });
