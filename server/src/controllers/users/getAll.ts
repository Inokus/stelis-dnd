import { usersRepository } from '@server/repositories/usersRepository';
import { adminProcedure } from '@server/trpc/adminProcedure';
import provideRepos from '@server/trpc/provideRepos';

export default adminProcedure
  .use(
    provideRepos({
      usersRepository,
    })
  )
  .query(async ({ ctx: { repos } }) => {
    const users = await repos.usersRepository.getAll();

    return users;
  });
