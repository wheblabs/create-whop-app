import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const tasks = pgTable('tasks', {
	id: uuid('id').defaultRandom().primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	completed: text('completed').notNull().default('false'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
