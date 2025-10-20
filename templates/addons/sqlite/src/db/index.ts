import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

/**
 * Database client configuration
 *
 * Local development (default):
 * - Uses a local SQLite file (./local.db)
 * - No setup required, works out of the box
 *
 * Production with Turso:
 * 1. Sign up for Turso: https://turso.tech
 * 2. Create a database: `turso db create my-app`
 * 3. Get the URL: `turso db show my-app --url`
 * 4. Create a token: `turso db tokens create my-app`
 * 5. Add to .env:
 *    DATABASE_URL=libsql://my-app-[name].turso.io
 *    DATABASE_AUTH_TOKEN=your-token-here
 */
const client = createClient({
	url: process.env.DATABASE_URL || 'file:./local.db',
	authToken: process.env.DATABASE_AUTH_TOKEN,
})

export const db = drizzle(client, { schema })
