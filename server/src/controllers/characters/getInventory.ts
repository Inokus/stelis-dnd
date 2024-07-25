import { idSchema } from '@server/entities/shared';
import { charactersItemsRepository } from '@server/repositories/charactersItemsRepository';
import { itemsRepository } from '@server/repositories/itemsRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';
import withTransaction from '@server/trpc/withTransaction';

export default authenticatedProcedure
  .use(withTransaction())
  .use(
    provideRepos({
      charactersItemsRepository,
      itemsRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: characterId, ctx: { repos } }) => {
    try {
      const characterItems =
        await repos.charactersItemsRepository.getAll(characterId);

      const itemIds = characterItems.map((item) => item.itemId);

      if (itemIds.length === 0) {
        return [];
      }

      return await repos.itemsRepository.getByIds(itemIds);
    } catch (error) {
      // if any operation fails, the transaction will automatically roll back
      throw error;
    }
  });
