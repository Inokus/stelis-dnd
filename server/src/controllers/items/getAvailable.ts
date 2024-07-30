import { itemsRepository } from '@server/repositories/itemsRepository';
import { restrictedItemsRepository } from '@server/repositories/restrictedItemsRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';
import withTransaction from '@server/trpc/withTransaction';
import { idSchema } from '@server/entities/shared';
import { assertError } from '@server/utils/errors';

export default authenticatedProcedure
  .use(withTransaction())
  .use(
    provideRepos({
      itemsRepository,
      restrictedItemsRepository,
    })
  )
  .input(idSchema)
  .query(async ({ input: campaignId, ctx: { repos } }) => {
    try {
      const restrictedItems =
        await repos.restrictedItemsRepository.getAll(campaignId);

      const itemIds = restrictedItems.map((item) => item.itemId);

      return await repos.itemsRepository.getAvailable(itemIds);
    } catch (error: unknown) {
      assertError(error);

      throw error;
    }
  });
