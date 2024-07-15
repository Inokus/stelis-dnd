import { z } from 'zod';
import type { Selectable } from 'kysely';
import type { Users } from '@server/database/types';
import { createdAtSchema, idSchema } from './shared';

export const userSchema = z.object({
  id: idSchema,
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username name must be at most 30 characters long')
    .regex(
      /^[a-z0-9_.]+$/,
      'Username can only contain letters, numbers, underscores, and periods'
    ),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'Password must be at most 64 characters long'),
  isAdmin: z.boolean(),
  createdAt: createdAtSchema,
});

export const userKeysAll = Object.keys(userSchema.shape) as (keyof Users)[];

export const userKeysPublic = [
  'id',
  'username',
  'isAdmin',
  'createdAt',
] as const;

export type UserPublic = Pick<
  Selectable<Users>,
  (typeof userKeysPublic)[number]
>;

export const authUserSchema = userSchema.pick({ id: true, isAdmin: true });
export type AuthUser = z.infer<typeof authUserSchema>;
