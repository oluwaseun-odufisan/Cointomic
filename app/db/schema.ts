import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    clerkId: text('clerk_id').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});