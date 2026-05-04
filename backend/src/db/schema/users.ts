import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const roleEnum = pgEnum('role', ['USER', 'ADMIN'])

export const users = pgTable('users', {
  id        : text('id').primaryKey().$defaultFn(() => createId()),
  name      : text('name').notNull(),
  username  : text('username').notNull().unique(),
  email     : text('email').notNull().unique(),
  password  : text('password').notNull(),
  avatar    : text('avatar'),            // simpan URL gambar
  role      : roleEnum('role').default('USER').notNull(),
  createdAt : timestamp('created_at').defaultNow().notNull(),
})

export type User       = typeof users.$inferSelect
export type NewUser    = typeof users.$inferInsert