import { idSchema } from '@server/entities/shared';
import { charactersItemsRepository } from '@server/repositories/charactersItemsRepository';
import { itemsRepository } from '@server/repositories/itemsRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';
import withTransaction from '@server/trpc/withTransaction';

export default authenticatedProcedure
  .use(
    provideRepos({
      charactersItemsRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: characterId, ctx: { repos } }) => {
    return await repos.charactersItemsRepository.getAll(characterId);
  });
