import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('users')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('username', 'text', (c) => c.unique().notNull())
    .addColumn('email', 'text', (c) => c.unique().notNull())
    .addColumn('password', 'text', (c) => c.notNull())
    .addColumn('salt', 'text', (c) => c.unique().notNull())
    .addColumn('is_admin', 'boolean', (c) => c.defaultTo(false).notNull())
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('users').execute();
}
