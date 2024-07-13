import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('restricted_items')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('item_id', 'integer', (c) => c.references('items.id').notNull())
    .addColumn('campaign_id', 'integer', (c) =>
      c.references('campaigns.id').notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('restricted_items').execute();
}
