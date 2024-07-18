import { hash } from 'bcrypt';
import { publicProcedure } from '@server/trpc';
import config from '@server/config';
import { TRPCError } from '@trpc/server';
import provideRepos from '@server/trpc/provideRepos';
import { usersRepository } from '@server/repositories/usersRepository';
import { assertError } from '@server/utils/errors';
import { userSchema } from '@server/entities/users';

export default publicProcedure
  .use(
    provideRepos({
      usersRepository,
    })
  )
  .input(
    userSchema.pick({
      username: true,
      email: true,
      password: true,
    })
  )
  .mutation(async ({ input: user, ctx: { repos } }) => {
    const passwordHash = await hash(user.password, config.auth.passwordCost);

    const userCreated = await repos.usersRepository
      .create({
        ...user,
        password: passwordHash,
      })
      // handling errors using the Promise.catch method
      .catch((error: unknown) => {
        assertError(error);

        // wrapping an ugly error into a user-friendly one
        if (error.message.includes('users_username_key')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User with this username already exists.',
            cause: error,
          });
        }

        if (error.message.includes('users_email_key')) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User with this email already exists.',
            cause: error,
          });
        }

        throw error;
      });

    return {
      id: userCreated.id,
    };
  });
