import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('campaigns')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('name', 'text', (c) => c.unique().notNull())
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('campaigns').execute();
}
