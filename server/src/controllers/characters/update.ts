import { characterSchema } from '@server/entities/characters';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import provideRepos from '@server/trpc/provideRepos';
import { charactersRepository } from '@server/repositories/charactersRepository';

export default authenticatedProcedure
  .use(provideRepos({ charactersRepository }))

  .input(
    characterSchema.pick({
      id: true,
      downtime: true,
    })
  )
  .mutation(async ({ input: characterData, ctx: { repos } }) => {
    const { id, ...updateData } = characterData;

    const characterUpdated = await repos.charactersRepository.update(
      id,
      updateData
    );

    return characterUpdated;
  });
