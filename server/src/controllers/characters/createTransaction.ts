import { transactionSchema } from '@server/entities/transactions';
import { itemsRepository } from '@server/repositories/itemsRepository';
import { charactersItemsRepository } from '@server/repositories/charactersItemsRepository';
import { transactionsRepository } from '@server/repositories/transactionsRepository';
import { authenticatedProcedure } from '@server/trpc/authenticatedProcedure';
import { TRPCError } from '@trpc/server';
import { assertError } from '@server/utils/errors';
import provideRepos from '@server/trpc/provideRepos';
import withTransaction from '@server/trpc/withTransaction';

export default authenticatedProcedure
  .use(withTransaction())
  .use(
    provideRepos({
      itemsRepository,
      charactersItemsRepository,
      transactionsRepository,
    })
  )
  .input(
    transactionSchema.pick({
      type: true,
      quantity: true,
      characterId: true,
      itemId: true,
    })
  )
  .mutation(async ({ input: transactionData, ctx: { repos } }) => {
    const { type, quantity, characterId, itemId } = transactionData;

    try {
      const characterItems =
        await repos.charactersItemsRepository.getAll(characterId);
      const existingItem = characterItems.find((item) => item.id === itemId);

      if (type === 'Buy') {
        if (existingItem) {
          await repos.charactersItemsRepository.update(characterId, itemId, {
            quantity: existingItem.quantity + quantity,
          });

          const transactionCreated = await repos.transactionsRepository.create({
            type,
            value: existingItem.value * quantity,
            itemId,
            characterId,
            quantity,
          });

          return {
            item: {
              ...existingItem,
              quantity: existingItem.quantity + quantity,
            },
            transactionCreated: {
              ...transactionCreated,
              name: existingItem.name,
            },
          };
        }

        const [newItem] = await repos.itemsRepository.getByIds([itemId]);

        await repos.charactersItemsRepository.create({
          itemId,
          characterId,
          quantity,
        });

        const transactionCreated = await repos.transactionsRepository.create({
          type,
          value: newItem.value * quantity,
          itemId,
          characterId,
          quantity,
        });

        return {
          item: {
            ...newItem,
            quantity,
          },
          transactionCreated: {
            ...transactionCreated,
            name: newItem.name,
          },
        };
      }

      if (!existingItem || existingItem.quantity < quantity) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Character does not have this item or does not have sufficient quantity.',
        });
      }

      const remainingQuantity = existingItem.quantity - quantity;

      if (remainingQuantity > 0) {
        await repos.charactersItemsRepository.update(characterId, itemId, {
          quantity: existingItem.quantity - quantity,
        });

        const transactionCreated = await repos.transactionsRepository.create({
          type,
          value: existingItem.value * quantity,
          itemId,
          characterId,
          quantity,
        });

        return {
          item: {
            ...existingItem,
            quantity: remainingQuantity,
          },
          transactionCreated: {
            ...transactionCreated,
            name: existingItem.name,
          },
        };
      }

      await repos.charactersItemsRepository.remove(characterId, itemId);

      const transactionCreated = await repos.transactionsRepository.create({
        type,
        value: existingItem.value * quantity,
        itemId,
        characterId,
        quantity,
      });

      return {
        item: {
          ...existingItem,
          quantity: remainingQuantity,
        },
        transactionCreated: {
          ...transactionCreated,
          name: existingItem.name,
        },
      };
    } catch (error: unknown) {
      assertError(error);

      throw error;
    }
  });
