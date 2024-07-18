import bcrypt from 'bcrypt';
import config from '@server/config';
import jsonwebtoken from 'jsonwebtoken';
import { publicProcedure } from '@server/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import provideRepos from '@server/trpc/provideRepos';
import { usersRepository } from '@server/repositories/usersRepository';
import { prepareTokenPayload } from '@server/trpc/tokenPayload';

const { expiresIn, tokenKey } = config.auth;

export default publicProcedure
  .use(
    provideRepos({
      usersRepository,
    })
  )
  .input(
    z.object({
      username: z.string().trim().toLowerCase(),
      password: z.string(),
    })
  )
  .mutation(async ({ input: { username, password }, ctx: { repos } }) => {
    const user = await repos.usersRepository.findByUsername(username);

    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'We could not find an account with this username',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Incorrect password. Please try again.',
      });
    }

    // What we will include in the token.
    const payload = prepareTokenPayload(user);

    const accessToken = jsonwebtoken.sign(payload, tokenKey, {
      expiresIn,
    });

    return {
      accessToken,
    };
  });
