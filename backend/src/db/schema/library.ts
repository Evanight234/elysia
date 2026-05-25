import { pgTable, text, timestamp, pgEnum, unique, integer, index } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { books } from './books'

export const libraryStatusEnum = pgEnum('library_status', ['SAVED', 'FAVORITE', 'READING'])

export const library = pgTable('library', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
  status: libraryStatusEnum('status').notNull(),
  lastChapterRead: integer('last_chapter_read').default(0),
  addedAt: timestamp('added_at').defaultNow().notNull(),
}, (table) => ({
  uniqueUserBook: unique().on(table.userId, table.bookId),
  userStatusIdx: index('library_user_status_idx').on(table.userId, table.status),
  userAddedAtIdx: index('library_user_added_at_idx').on(table.userId, table.addedAt),
}))

export type Library = typeof library.$inferSelect
export type NewLibrary = typeof library.$inferInsert