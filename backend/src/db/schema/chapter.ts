import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { books } from './books'

export const chapters = pgTable('chapters', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    bookId: text('book_id').notNull().references(() => books.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),        // "Chapter 1: Awal Perjalanan"
    content: text('content').notNull(),      // isi teks chapter
    order: integer('order').notNull(),     // urutan: 1, 2, 3, ...
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Chapter = typeof chapters.$inferSelect
export type NewChapter = typeof chapters.$inferInsert