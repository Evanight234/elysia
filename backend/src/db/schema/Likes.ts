import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { books } from './books'

export const Likes = pgTable('likes', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    uniqueUserBook: unique().on(table.userId, table.bookId),
}))

export type Like = typeof Likes.$inferSelect
export type NewLike = typeof Likes.$inferInsert