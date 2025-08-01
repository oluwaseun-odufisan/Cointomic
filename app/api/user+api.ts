import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const db = drizzle(sql);
        const { name, email, clerkId } = await request.json();

        if (!name || !email || !clerkId) {
            return Response.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        if (existingUser.length > 0) {
            return Response.json(
                { error: 'User already exists' },
                { status: 409 }
            );
        }

        const response = await db
            .insert(users)
            .values({ name, email, clerkId })
            .returning();

        return new Response(JSON.stringify({ data: response }), {
            status: 201,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}