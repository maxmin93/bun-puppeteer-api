import { Elysia, t } from 'elysia';
import { launchBrowser, searchPlaces } from '$lib/scraper';

export const app = new Elysia().decorate('browser', await launchBrowser()).get(
  '/search',
  async ({ browser, query: { q } }) => {
    console.log(`query params: q="${q}"`);
    if ((q?.trim()?.length || 0) === 0) {
      throw new Error('invalid empty query');
    }
    return {
      query: q,
      results: await searchPlaces(browser, q),
    };
  },
  {
    query: t.Object({
      q: t.String(),
    }),
  }
);
