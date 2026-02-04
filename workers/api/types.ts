/// <reference types="@cloudflare/workers-types" />

import { drizzle } from 'drizzle-orm/d1'

// Cloudflare Workers 环境绑定类型
export type Bindings = {
  R2_PUBLIC_URL?: string  // R2 公开 URL（可选，本地开发时为空）
  DB: D1Database
  ASSETS: R2Bucket // R2 存储桶用于图片
}

// Drizzle 数据库实例类型
export type DrizzleDB = ReturnType<typeof drizzle>

// 用户信息类型（从数据库查询返回）
export type User = {
  id: number
  username: string
  email: string
  password_hash: string
  avatar: string | null
  wechat: string | null
  qq: string | null
  yy: string | null
  created_at: Date | null
}

// 公开的用户信息（不含密码）
export type PublicUser = Omit<User, 'password_hash'>

// 队伍信息类型
export type Team = {
  id: number
  game: string
  title: string
  description: string | null
  rank_requirement: string | null
  contact_method: string
  contact_value: string
  creator_id: number
  status: string
  member_count: number
  max_members: number
  created_at: Date | null
  updated_at: Date | null
}

// 队伍成员类型
export type TeamMember = {
  id: number
  team_id: number
  user_id: number
  joined_at: Date | null
}

// 会话类型
export type Session = {
  id: number
  user_id: number
  token: string
  expires_at: Date
  created_at: Date | null
}
