import { Elysia, t, NotFoundError } from 'elysia';
import { handleError } from '$lib/error';
import { Browser } from 'puppeteer';
import { app as dbApp } from './server-db';
import { app as htmlApp } from './server-html';
import { app as puppeteerApp } from './server-puppeteer';

const app = new Elysia()
  .use(dbApp)
  .use(htmlApp)
  .use(puppeteerApp)
  .onError((err) => handleError(err))
  .onStart(async ({ browser }) => {
    console.log('💫 Elysia start!');
    if (browser && browser instanceof Browser) {
      console.log('Browser version :', await browser.version());
    }
  })
  .onStop(async ({ browser, db }) => {
    if (browser && browser instanceof Browser) {
      await browser.close();
      console.log('Browser is closed!');
    }
    console.log('💤 Elysia stop!');
  });

app
  .post('/', () => {
    throw new NotFoundError();
  })
  .get('/hello', () => ({ message: 'Hello Elysia' }))
  .get('/err', () => {
    throw new Error('Server is during maintainance');
  });

app
  .get(
    '/path/:id',
    ({ params: { id } }) => {
      console.log(`path params: id=${id}`, typeof id);
      return new Response(
        JSON.stringify({
          type: 'path',
          params: [id],
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    },
    {
      params: t.Object({
        id: t.Numeric(), // parseInt(params.id) 대신에 형변환 처리
      }),
    }
  )
  .get(
    '/query',
    ({ query: { id } }) => {
      console.log(`query params: id=${id}`, typeof id);
      return {
        type: 'query',
        params: [id],
      };
    },
    {
      query: t.Object({
        id: t.Numeric(), // parseInt(query.id) 대신에 형변환 처리
      }),
    }
  );

(() => {
  const port = process.env.PORT || 8000;
  try {
    app.listen(
      {
        port,
        hostname: '0.0.0.0',
      },
      ({ hostname, port }) => {
        console.log(`🦊 Elysia is running at ${hostname}:${port}`);
      }
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  // https://bun.sh/guides/process/os-signals
  process.on('SIGINT', () => {
    console.log('\n\nReceived SIGINT');
    app.stop();
  });
})();
