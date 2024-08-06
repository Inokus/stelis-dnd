import { idSchema } from '@server/entities/shared';
import { charactersItemsRepository } from '@server/repositories/charactersItemsRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';

export default authenticatedProcedure
  .use(
    provideRepos({
      charactersItemsRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: characterId, ctx: { repos } }) => {
    const items = await repos.charactersItemsRepository.getAll(characterId);

    return items;
  });
