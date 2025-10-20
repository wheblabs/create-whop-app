import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * Example table - feel free to modify or remove
 */
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
})
