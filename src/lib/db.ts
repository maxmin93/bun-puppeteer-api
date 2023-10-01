// import { Database } from 'bun:sqlite';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sql, eq } from 'drizzle-orm';
import * as schema from '../../drizzle/schema';

export type NewBook = typeof schema.books.$inferInsert;

export class BooksDatabase {
  private db: LibSQLDatabase;

  constructor() {
    if (process.env.TURSO_DB_URL === undefined) {
      throw new Error('TURSO_DB_URL is not defined');
    }
    if (process.env.TURSO_DB_AUTH_TOKEN === undefined) {
      throw new Error('TURSO_DB_AUTH_TOKEN is not defined');
    }

    const client = createClient({
      url: process.env.TURSO_DB_URL,
      authToken: process.env.TURSO_DB_AUTH_TOKEN,
    });
    this.db = drizzle(client);

    this.init()
      .then(() => console.log('Database initialized'))
      .catch(console.error);
  }

  async init() {
    return this.db.run(sql`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        author TEXT
      )
    `);
  }

  async getBooks() {
    return await this.db.select().from(schema.books);
  }

  async addBook(book: NewBook) {
    return await this.db
      .insert(schema.books)
      .values({
        name: book.name,
        author: book.author,
      })
      .returning();
  }

  async updateBook(id: number, book: NewBook) {
    return await this.db
      .update(schema.books)
      .set({
        name: book.name,
        author: book.author,
      })
      .where(eq(schema.books.id, id))
      .returning({ affectedId: schema.books.id });
  }

  async deleteBook(id: number) {
    return await this.db
      .delete(schema.books)
      .where(eq(schema.books.id, id))
      .returning({ affectedId: schema.books.id });
  }
}
