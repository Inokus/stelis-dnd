import { idSchema } from '@server/entities/shared';
import { adminProcedure } from '@server/trpc/adminProcedure';
import provideRepos from '@server/trpc/provideRepos';
import { itemsRepository } from '@server/repositories/itemsRepository';
import { z } from 'zod';

export default adminProcedure
  .use(provideRepos({ itemsRepository }))

  .input(
    z.object({
      id: idSchema,
    })
  )
  .mutation(async ({ input: { id }, ctx: { repos } }) => {
    const itemRemoved = await repos.itemsRepository.remove(id);

    return itemRemoved;
  });
