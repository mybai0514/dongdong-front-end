import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  username: text('username').notNull(),
  password_hash: text('password_hash').notNull(),
  avatar_url: text('avatar_url'),
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  game: text('game').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  contact: text('contact'),
  creator_id: integer('creator_id').notNull().references(() => users.id),
  status: text('status').notNull().default('open'), // open, closed, full
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})

export const feedback = sqliteTable('feedback', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  month: text('month').notNull(), // 格式: 2025-01
  created_at: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
})