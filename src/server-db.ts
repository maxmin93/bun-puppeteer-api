// schema builder 't' - https://github.com/sinclairzx81/typebox
import { Value } from '@sinclair/typebox/value';
import { Elysia, t } from 'elysia';
import { BooksDatabase } from '$lib/db';

// https://elysiajs.com/patterns/reference-models.html
const bookModel = new Elysia().model({
  book: t.Object({
    name: t.String(),
    author: t.String(),
  }),
  result: t.Object({
    success: t.Boolean(),
    operator: t.Optional(
      // === operator?: string
      t.Union([t.Literal('create'), t.Literal('update'), t.Literal('delete')])
    ),
    data: t.Optional(t.Object({})),
    affectedId: t.Optional(t.Number()),
  }),
});

export const app = new Elysia()
  .use(bookModel)
  .decorate('db', new BooksDatabase())
  .get('/books', ({ db }) => db.getBooks())
  .post(
    '/books',
    async ({ db, body }) => {
      try {
        const result = await db.addBook(body);
        return { success: true, data: result.shift() };
      } catch (e) {
        console.error('create:', e);
        return { success: false, operator: 'create' };
      }
    },
    // https://elysiajs.com/concept/schema.html#local-schema
    {
      body: 'book',
      response: 'result',
    }
  )
  .put(
    '/books/:id',
    async ({ db, params, body }) => {
      try {
        const result: any[] = await db.updateBook(params.id, body);
        return { success: true, ...result.shift() };
        // return { success: true, ...(result.length > 0 ? result[0] : {}) };
      } catch (e) {
        console.error('update:', e);
        return { success: false, operator: 'update' };
      }
    },
    {
      body: 'book',
      response: 'result',
      // Elysia 상용구 https://elysiajs.com/concept/numeric.html
      params: t.Object({
        id: t.Numeric(), // parseInt(params.id) 대신에 형변환 처리
      }),
    }
  )
  .delete(
    '/books/:id',
    async ({ db, params }) => {
      try {
        const result = await db.deleteBook(params.id);
        return { success: true, ...result.shift() };
      } catch (e) {
        console.error('delete:', e);
        return { success: false, operator: 'delete' };
      }
    },
    {
      response: 'result',
      params: t.Object({
        id: t.Numeric(), // parseInt(params.id) 대신에 형변환 처리
      }),
    }
  );
