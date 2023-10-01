import { Elysia } from 'elysia';
import { html } from '@elysiajs/html';

export const app = new Elysia()
  .use(html())
  .get('/', () => Bun.file('src/html/index.html').text())
  .get('/script.js', () => Bun.file('src/html/script.js').text())
  .get('/html', ({ html }) =>
    html(`
    <html lang="en">
      <head>
        <title>Hello World</title>
      </head>
      <body>
        <h1>Hello World v2</h1>
      </body>
    </html>
  `)
  );
