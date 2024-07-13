import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('downtimes')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('type', 'text', (c) => c.notNull())
    .addColumn('days', 'integer', (c) => c.notNull())
    .addColumn('description', 'text', (c) => c.notNull())
    .addColumn('character_id', 'integer', (c) =>
      c.references('characters.id').notNull()
    )
    .addColumn('created_at', 'timestamptz', (column) =>
      column.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('downtimes').execute();
}
