import { idSchema } from '@server/entities/shared';
import { downtimesRepository } from '@server/repositories/downtimesRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';

export default authenticatedProcedure
  .use(
    provideRepos({
      downtimesRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: characterId, ctx: { repos } }) => {
    return await repos.downtimesRepository.getAll(characterId);
  });
