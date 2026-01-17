import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, or } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { users, sessions } from '../../../db/schema'
import { createSession, extractToken, validateToken } from '../utils/token'
import type { Bindings } from '../types'

const auth = new Hono<{ Bindings: Bindings }>()

// 用户注册
auth.post('/register', async (c) => {
  try {
    const { username, email, password, wechat, qq, yy } = await c.req.json()

    // 验证必填字段
    if (!username || !email || !password) {
      return c.json({ error: '用户名、邮箱和密码不能为空' }, 400)
    }

    // 验证密码长度
    if (password.length < 6) {
      return c.json({ error: '密码长度至少为 6 位' }, 400)
    }

    const db = drizzle(c.env.DB)

    // 检查用户名或邮箱是否已存在
    const existingUser = await db.select().from(users)
      .where(
        or(
          eq(users.email, email),
          eq(users.username, username)
        )
      )
      .get()

    if (existingUser) {
      return c.json({ error: '用户名或邮箱已被注册' }, 400)
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // 创建用户
    const result = await db.insert(users).values({
      username,
      email,
      password_hash: passwordHash,
      wechat: wechat || null,
      qq: qq || null,
      yy: yy || null,
      created_at: new Date()
    }).run()

    const userId = result.meta.last_row_id as number

    // 创建会话
    const token = await createSession(db, userId)

    return c.json({
      success: true,
      message: '注册成功',
      token,
      user: {
        id: userId,
        username,
        email,
        wechat,
        qq,
        yy
      }
    })
  } catch (error) {
    console.error('注册错误:', error)
    return c.json({ error: '注册失败，请稍后重试' }, 500)
  }
})

// 用户登录
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: '邮箱和密码不能为空' }, 400)
    }

    // 通过email拿到数据库中的用户信息，检查用户是否存在
    const db = drizzle(c.env.DB)
    const user = await db.select().from(users).where(eq(users.email, email)).get()

    if (!user) {
      return c.json({ error: '邮箱或密码错误' }, 401)
    }

    // 验证密码:通过数据库中的密码hash，和用户输入的密码进行验证
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return c.json({ error: '邮箱或密码错误' }, 401)
    }

    // 创建会话
    const token = await createSession(db, user.id)

    return c.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        wechat: user.wechat,
        qq: user.qq,
        yy: user.yy
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    return c.json({ error: '登录失败，请稍后重试' }, 500)
  }
})

// 验证 token（获取当前用户信息）
auth.get('/me', async (c) => {
  try {
    const token = extractToken(c.req.header('Authorization'))
    if (!token) {
      return c.json({ error: '未提供认证令牌' }, 401)
    }

    const db = drizzle(c.env.DB)
    const user = await validateToken(db, token)

    if (!user) {
      return c.json({ error: '无效或过期的令牌' }, 401)
    }

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        wechat: user.wechat,
        qq: user.qq,
        yy: user.yy
      }
    })
  } catch (error) {
    console.error('验证令牌错误:', error)
    return c.json({ error: '验证失败' }, 500)
  }
})

// 登出
auth.post('/logout', async (c) => {
  try {
    const token = extractToken(c.req.header('Authorization'))
    if (!token) {
      return c.json({ error: '未提供认证令牌' }, 401)
    }

    const db = drizzle(c.env.DB)

    // 删除 session
    await db.delete(sessions).where(eq(sessions.token, token)).run()

    return c.json({ success: true, message: '登出成功' })
  } catch (error) {
    console.error('登出错误:', error)
    return c.json({ error: '登出失败' }, 500)
  }
})

export default auth
