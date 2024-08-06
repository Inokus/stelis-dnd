import { itemSchema } from '@server/entities/items';
import { adminProcedure } from '@server/trpc/adminProcedure';
import { TRPCError } from '@trpc/server';
import provideRepos from '@server/trpc/provideRepos';
import { itemsRepository } from '@server/repositories/itemsRepository';
import { assertError } from '@server/utils/errors';

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

    try {
      const itemUpdated = await repos.itemsRepository.update(id, updateData);

      return itemUpdated;
    } catch (error: unknown) {
      assertError(error);

      if (error.message.includes('items_name_key')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Item with this name already exists.',
          cause: error,
        });
      }

      throw error;
    }
  });
