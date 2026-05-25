import { pgTable, text, timestamp, integer, unique } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { books } from './books'
import { chapters } from './chapter'

// Menyimpan progress bacaan user per buku
export const readingProgress = pgTable('reading_progress', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    lastChapterId: text('last_chapter_id').references(() => chapters.id),
    completedChapters: text('completed_chapters').array().default([]).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    uniqueUserBook: unique().on(table.userId, table.bookId),
}))

export type ReadingProgress = typeof readingProgress.$inferSelect
export type NewReadingProgress = typeof readingProgress.$inferInsert