import { pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { books } from './books'

export const likes = pgTable('likes', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    uniqueUserBook: unique().on(table.userId, table.bookId), // 1 user 1 like per buku
}))

export type Like = typeof likes.$inferSelect
export type NewLike = typeof likes.$inferInsert