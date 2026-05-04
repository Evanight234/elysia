import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'
import { users } from './users'

export const profile = pgTable('profile', {
  id        : text('id').primaryKey().$defaultFn(() => createId()),
  userId    : text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  bio       : text('bio'),
  avatar    : text('avatar'),              // URL gambar profil
  phone     : text('phone'),
  address   : text('address'),
  createdAt : timestamp('created_at').defaultNow().notNull(),
  updatedAt : timestamp('updated_at').defaultNow().notNull(),
})

export type Profile    = typeof profile.$inferSelect
export type NewProfile = typeof profile.$inferInsert