import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('characters')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('name', 'text', (c) => c.notNull())
    .addColumn('downtime', 'integer', (c) => c.defaultTo(0).notNull())
    .addColumn('user_id', 'integer', (c) => c.references('users.id').notNull())
    .addColumn('campaign_id', 'integer', (c) =>
      c.references('campaigns.id').notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('characters').execute();
}
