import { db } from '@/app/db';
import { User } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { ClerkClient, createClerkClient } from '@clerk/clerk-sdk-node';
import { ExpoResponse } from 'expo-router/server';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(request: Request) {
    try {
        const { clerkUserId, phoneNumber, email } = await request.json();

        if (!clerkUserId) {
            return ExpoResponse.json({ error: 'Missing clerkUserId' }, { status: 400 });
        }

        // Verify Clerk user
        const clerkUser = await clerk.users.getUser(clerkUserId);
        if (!clerkUser) {
            return ExpoResponse.json({ error: 'Invalid Clerk user' }, { status: 401 });
        }

        // Check if user exists in Neon
        const existingUser = await db
            .select()
            .from(User)
            .where(eq(User.clerkUserId, clerkUserId))
            .limit(1);

        if (existingUser.length > 0) {
            // Update existing user
            const updatedUser = await db
                .update(User)
                .set({
                    phoneNumber: phoneNumber || existingUser[0].phoneNumber,
                    email: email || existingUser[0].email,
                    updatedAt: new Date(),
                })
                .where(eq(User.clerkUserId, clerkUserId))
                .returning();

            return ExpoResponse.json(updatedUser[0]);
        }

        // Create new user
        const newUser = await db
            .insert(User)
            .values({
                clerkUserId,
                phoneNumber,
                email,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return ExpoResponse.json(newUser[0]);
    } catch (error: any) {
        console.error('Error syncing user:', error);
        return ExpoResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }
}