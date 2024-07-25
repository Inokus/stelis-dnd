import { itemSchema } from '@server/entities/items';
import { idSchema } from '@server/entities/shared';
import { adminProcedure } from '@server/trpc/adminProcedure';
import provideRepos from '@server/trpc/provideRepos';
import withTransaction from '@server/trpc/withTransaction';
import { itemsRepository } from '@server/repositories/itemsRepository';
import { restrictedItemsRepository } from '@server/repositories/restrictedItemsRepository';
import { z } from 'zod';

export default adminProcedure
  .use(withTransaction())
  .use(provideRepos({ itemsRepository, restrictedItemsRepository }))

  .input(
    z.object({
      itemData: itemSchema.pick({
        name: true,
        description: true,
        value: true,
        isCurrency: true,
      }),
      campaignId: idSchema.optional(),
    })
  )
  .mutation(async ({ input: { itemData, campaignId }, ctx: { repos } }) => {
    try {
      const itemCreated = await repos.itemsRepository.create(itemData);
      if (campaignId) {
        await repos.restrictedItemsRepository.create({
          itemId: itemCreated.id,
          campaignId,
        });
      }

      return itemCreated;
    } catch (error) {
      // if any operation fails, the transaction will automatically roll back
      throw error;
    }
  });
