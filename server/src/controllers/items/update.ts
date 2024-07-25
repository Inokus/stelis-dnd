import { itemSchema } from '@server/entities/items';
import { adminProcedure } from '@server/trpc/adminProcedure';
import provideRepos from '@server/trpc/provideRepos';
import { itemsRepository } from '@server/repositories/itemsRepository';

export default adminProcedure
  .use(provideRepos({ itemsRepository }))

  .input(
    itemSchema.pick({
      id: true,
      name: true,
      description: true,
      value: true,
    })
  )
  .mutation(async ({ input: itemData, ctx: { repos } }) => {
    const { id, ...updateData } = itemData;

    const itemUpdated = await repos.itemsRepository.update(id, updateData);

    return itemUpdated;
  });
