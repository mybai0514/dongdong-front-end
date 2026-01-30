import { eq } from 'drizzle-orm'
import { sessions, users } from '../../../db/schema'
import { getNowUTC8, compareTimesUTC8 } from './time'
import type { DrizzleDB, User } from '../types'

/**
 * 生成随机 token
 */
export function generateToken(): string {
  return crypto.randomUUID() + '-' + Date.now().toString(36)
}

/**
 * 创建会话（7天有效期）
 */
export async function createSession(db: DrizzleDB, userId: number): Promise<string> {
  const token = generateToken()
  const nowUTC8 = getNowUTC8()
  const expiresAtTime = nowUTC8.getTime() + 7 * 24 * 60 * 60 * 1000 // 7天后过期
  const expiresAt = new Date(expiresAtTime)

  await db.insert(sessions).values({
    user_id: userId,
    token,
    expires_at: expiresAt,
    created_at: nowUTC8
  }).run()

  return token
}

/**
 * 验证 token 是否有效，返回用户信息
 */
export async function validateToken(db: DrizzleDB, token: string): Promise<User | null> {
  const session = await db.select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .get()

  if (!session) return null

  // 检查是否过期（使用 UTC+8 时区比较）
  if (compareTimesUTC8(session.expires_at, getNowUTC8()) < 0) {
    // 删除过期的 session
    await db.delete(sessions).where(eq(sessions.token, token)).run()
    return null
  }

  // 获取用户信息
  const user = await db.select().from(users).where(eq(users.id, session.user_id)).get()
  return user || null
}

/**
 * 从 Authorization header 中提取 token
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
