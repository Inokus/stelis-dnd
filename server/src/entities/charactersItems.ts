import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { CharactersItems } from '@server/database/types';
import { idSchema } from './shared';

export const characterItemSchema = z.object({
  id: idSchema,
  quantity: z.number().int().nonnegative(),
  characterId: idSchema,
  itemId: idSchema,
});

export const characterItemKeysAll = Object.keys(
  characterItemSchema.shape
) as (keyof CharactersItems)[];

export const characterItemKeysPublic = characterItemKeysAll;

export type CharacterItemPublic = Pick<
  Selectable<CharactersItems>,
  (typeof characterItemKeysPublic)[number]
>;
