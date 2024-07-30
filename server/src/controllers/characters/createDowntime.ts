import { downtimeSchema } from '@server/entities/downtimes';
import { charactersRepository } from '@server/repositories/charactersRepository';
import { downtimesRepository } from '@server/repositories/downtimesRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { TRPCError } from '@trpc/server';
import { assertError } from '@server/utils/errors';
import provideRepos from '@server/trpc/provideRepos';
import withTransaction from '@server/trpc/withTransaction';

export default authenticatedProcedure
  .use(withTransaction())
  .use(
    provideRepos({
      charactersRepository,
      downtimesRepository,
    })
  )
  .input(
    downtimeSchema.pick({
      type: true,
      days: true,
      description: true,
      characterId: true,
    })
  )
  .mutation(async ({ input: downtimeData, ctx: { repos } }) => {
    const { type, days, description, characterId } = downtimeData;

    try {
      const character = await repos.charactersRepository.getById(characterId);

      const newDowntime = character.downtime - days;

      if (newDowntime < 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Character downtime cannot be negative.',
        });
      }

      const characterUpdated = await repos.charactersRepository.update(
        characterId,
        {
          downtime: newDowntime,
        }
      );
      const downtimeCreated = await repos.downtimesRepository.create({
        type,
        days,
        description,
        characterId,
      });

      return {
        newDowntime: characterUpdated.downtime,
        downtimeCreated: downtimeCreated,
      };
    } catch (error: unknown) {
      assertError(error);

      throw error;
    }
  });
