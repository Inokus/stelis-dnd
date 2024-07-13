import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('items')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('name', 'text', (c) => c.unique().notNull())
    .addColumn('description', 'text', (c) => c.notNull())
    .addColumn('value', 'integer', (c) => c.notNull())
    .addColumn('is_currency', 'boolean', (c) => c.defaultTo(false).notNull())
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('items').execute();
}
