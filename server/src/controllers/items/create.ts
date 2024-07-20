import { itemSchema } from '@server/entities/items';
import { adminProcedure } from '@server/trpc/adminProcedure';
import provideRepos from '@server/trpc/provideRepos';
import { itemsRepository } from '@server/repositories/itemsRepository';

export default adminProcedure
  .use(provideRepos({ itemsRepository }))

  .input(
    itemSchema.pick({
      name: true,
      description: true,
      value: true,
      isCurrency: true,
    })
  )
  .mutation(async ({ input: itemData, ctx: { repos } }) => {
    const itemCreated = await repos.itemsRepository.create(itemData);

    return itemCreated;
  });
