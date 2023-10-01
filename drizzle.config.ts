import type { Config } from 'drizzle-kit';

// https://docs.turso.tech/tutorials/e-commerce-store-codelab/step-03-configuring-drizzle#previewing-the-turso-database-using-drizzle
export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DB_URL as string,
    authToken: process.env.TURSO_DB_AUTH_TOKEN as string,
  },
} satisfies Config;
