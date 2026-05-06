import { pgTable, text, timestamp, pgEnum, unique, integer } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { books } from './books'

export const libraryStatusEnum = pgEnum('library_status', ['SAVED', 'FAVORITE', 'READING'])

export const library = pgTable('library', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  status: libraryStatusEnum('status').notNull(),
  lastChapterRead: integer('last_chapter_read').default(0),  // ← BARU: chapter terakhir dibaca
  addedAt: timestamp('added_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserBook: unique().on(table.userId, table.bookId),
}))

export type Library = typeof library.$inferSelect
export type NewLibrary = typeof library.$inferInsert