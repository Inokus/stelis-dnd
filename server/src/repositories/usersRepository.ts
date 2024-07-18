import type { Database } from '@server/database';
import type { Users } from '@server/database/types';
import {
  type UserPublic,
  userKeysAll,
  userKeysPublic,
} from '@server/entities/users';
import type { Insertable, Selectable } from 'kysely';

export function usersRepository(db: Database) {
  return {
    async create(user: Insertable<Users>): Promise<UserPublic> {
      return db
        .insertInto('users')
        .values(user)
        .returning(userKeysPublic)
        .executeTakeFirstOrThrow();
    },

    async findByUsername(
      username: string
    ): Promise<Selectable<Users> | undefined> {
      return db
        .selectFrom('users')
        .select(userKeysAll)
        .where('username', '=', username)
        .executeTakeFirst();
    },
  };
}

export type UsersRepository = ReturnType<typeof usersRepository>;
