import { Context, Next } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { extractToken, validateToken } from '../utils/token'
import type { Bindings, User } from '../types'

// 扩展 Context 类型，添加 user 属性
declare module 'hono' {
  interface ContextVariableMap {
    user: User
  }
}

/**
 * 认证中间件 - 验证用户登录状态
 * 验证成功后将用户信息存入 c.var.user
 */
export async function authMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  const token = extractToken(c.req.header('Authorization'))

  if (!token) {
    return c.json({ error: '未提供认证令牌' }, 401)
  }

  const db = drizzle(c.env.DB)
  const user = await validateToken(db, token)

  if (!user) {
    return c.json({ error: '无效或过期的令牌' }, 401)
  }

  c.set('user', user)
  await next()
}

/**
 * 可选认证中间件 - 不强制要求登录
 * 如果提供了有效 token，将用户信息存入 c.var.user
 */
export async function optionalAuthMiddleware(c: Context<{ Bindings: Bindings }>, next: Next) {
  const token = extractToken(c.req.header('Authorization'))

  if (token) {
    const db = drizzle(c.env.DB)
    const user = await validateToken(db, token)
    if (user) {
      c.set('user', user)
    }
  }

  await next()
}
