import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'
import { chapters } from './chapter'

// Fungsi: Simpan komentar user pada paragraf tertentu dalam sebuah chapter
export const paragraphComments = pgTable('paragraph_comments', {
    id: text('id').primaryKey().$defaultFn(() => createId()),
    chapterId: text('chapter_id').notNull().references(() => chapters.id, { onDelete: 'cascade' }),
    paragraphId: integer('paragraph_id').notNull(),  // nomor urut paragraf
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type ParagraphComment = typeof paragraphComments.$inferSelect
export type NewParagraphComment = typeof paragraphComments.$inferInsert