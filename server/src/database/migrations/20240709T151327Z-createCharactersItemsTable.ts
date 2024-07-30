import type { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('characters_items')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('quantity', 'integer', (c) => c.notNull())
    .addColumn('character_id', 'integer', (c) =>
      c.references('characters.id').onDelete('cascade').notNull()
    )
    .addColumn('item_id', 'integer', (c) =>
      c.references('items.id').onDelete('cascade').notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('characters_items').execute();
}
