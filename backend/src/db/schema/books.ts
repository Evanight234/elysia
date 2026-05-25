import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'

export const books = pgTable('books', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  description: text('description'),
  cover: text('cover'),
  category: text('category').notNull(),
  fileUrl: text('file_url'),
  viewCount: integer('view_count').default(0).notNull(),
  likeCount: integer('like_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Book = typeof books.$inferSelect
export type NewBook = typeof books.$inferInsert