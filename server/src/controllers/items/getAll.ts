import { itemsRepository } from '@server/repositories/itemsRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';

export default authenticatedProcedure
  .use(
    provideRepos({
      itemsRepository,
    })
  )
  .query(async ({ ctx: { repos } }) => {
    const items = await repos.itemsRepository.getAll();

    return items;
  });
