import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { RestrictedItems } from '@server/database/types';
import { idSchema } from './shared';

export const restrictedItemSchema = z.object({
  id: idSchema,
  itemId: idSchema,
  campaignId: idSchema,
});

export const restrictedItemKeysAll = Object.keys(
  restrictedItemSchema.shape
) as (keyof RestrictedItems)[];

export const restrictedItemKeysPublic = restrictedItemKeysAll;

export type RestrictedItemPublic = Pick<
  Selectable<RestrictedItems>,
  (typeof restrictedItemKeysPublic)[number]
>;
