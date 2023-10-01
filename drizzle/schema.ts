import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// https://orm.drizzle.team/docs/column-types/sqlite
export const books = sqliteTable('books', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  author: text('author').notNull(),
});
