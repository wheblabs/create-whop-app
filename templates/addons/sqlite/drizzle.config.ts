import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	schema: './src/db/schema.ts',
	out: './drizzle',
	dialect: 'turso',
	dbCredentials: {
		url: process.env.DATABASE_URL || 'file:./local.db',
		authToken: process.env.DATABASE_AUTH_TOKEN,
	},
})
