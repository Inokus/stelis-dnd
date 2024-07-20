import { charactersRepository } from '@server/repositories/charactersRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';

export default authenticatedProcedure
  .use(
    provideRepos({
      charactersRepository,
    })
  )
  .query(async ({ ctx: { repos, authUser } }) => {
    const characters = await repos.charactersRepository.getAvailable(
      authUser.id
    );

    return characters;
  });
