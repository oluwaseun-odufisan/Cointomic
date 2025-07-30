import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not found in environment');
}

export default defineConfig({
    dialect: 'postgresql',
    schema: './app/db/schema.ts',
    out: './drizzle',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
    strict: true,
});