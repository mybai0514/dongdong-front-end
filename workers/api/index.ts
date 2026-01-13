/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc } from 'drizzle-orm'
import { teams, users, feedback } from '../../db/schema'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// 允许跨域请求（让 Next.js 前端可以调用）
app.use('/*', cors())

// ==================== 健康检查 ====================
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ==================== 用户相关 API ====================

// 用户注册
app.post('/api/auth/register', async (c) => {
  try {
    const { email, username, password } = await c.req.json()
    
    // 简单验证
    if (!email || !username || !password) {
      return c.json({ error: '邮箱、用户名和密码不能为空' }, 400)
    }

    const db = drizzle(c.env.DB)
    
    // 检查邮箱是否已存在
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get()
    if (existingUser) {
      return c.json({ error: '该邮箱已被注册' }, 400)
    }

    // 这里应该使用 bcrypt 等库加密密码，简化版本直接存储
    // 生产环境必须加密！
    const result = await db.insert(users).values({
      email,
      username,
      password_hash: password, // ⚠️ 实际项目需要加密
      created_at: new Date()
    }).run()

    return c.json({ 
      success: true, 
      userId: result.meta.last_row_id,
      message: '注册成功' 
    })
  } catch (error) {
    return c.json({ error: '注册失败' }, 500)
  }
})

// 用户登录（简化版）
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    if (!email || !password) {
      return c.json({ error: '邮箱和密码不能为空' }, 400)
    }

    const db = drizzle(c.env.DB)
    const user = await db.select().from(users).where(eq(users.email, email)).get()

    if (!user || user.password_hash !== password) {
      return c.json({ error: '邮箱或密码错误' }, 401)
    }

    // 返回用户信息（实际项目应该返回 JWT token）
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url
      }
    })
  } catch (error) {
    return c.json({ error: '登录失败' }, 500)
  }
})

// 获取用户信息
app.get('/api/users/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = drizzle(c.env.DB)
    
    const user = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      avatar_url: users.avatar_url,
      created_at: users.created_at
    }).from(users).where(eq(users.id, Number(id))).get()

    if (!user) {
      return c.json({ error: '用户不存在' }, 404)
    }

    return c.json(user)
  } catch (error) {
    return c.json({ error: '获取用户信息失败' }, 500)
  }
})

// ==================== 组队相关 API ====================

// 获取所有组队信息（支持筛选）
app.get('/api/teams', async (c) => {
  try {
    const game = c.req.query('game') // 可选：按游戏筛选
    const status = c.req.query('status') || 'open' // 默认只显示开放的队伍
    
    const db = drizzle(c.env.DB)
    let query = db.select().from(teams)

    // 添加筛选条件
    if (game) {
      query = query.where(eq(teams.game, game)) as any
    }
    if (status) {
      query = query.where(eq(teams.status, status)) as any
    }

    const allTeams = await query.orderBy(desc(teams.created_at)).all()
    
    return c.json(allTeams)
  } catch (error) {
    return c.json({ error: '获取组队列表失败' }, 500)
  }
})

// 获取单个组队详情
app.get('/api/teams/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = drizzle(c.env.DB)
    
    const team = await db.select().from(teams).where(eq(teams.id, Number(id))).get()

    if (!team) {
      return c.json({ error: '组队信息不存在' }, 404)
    }

    return c.json(team)
  } catch (error) {
    return c.json({ error: '获取组队详情失败' }, 500)
  }
})

// 创建新的组队
app.post('/api/teams', async (c) => {
  try {
    const { game, title, description, contact, creator_id } = await c.req.json()
    
    // 验证必填字段
    if (!game || !title || !creator_id) {
      return c.json({ error: '游戏、标题和创建者ID不能为空' }, 400)
    }

    const db = drizzle(c.env.DB)
    
    const result = await db.insert(teams).values({
      game,
      title,
      description,
      contact,
      creator_id,
      status: 'open',
      created_at: new Date()
    }).run()

    return c.json({ 
      success: true, 
      teamId: result.meta.last_row_id,
      message: '组队创建成功' 
    })
  } catch (error) {
    return c.json({ error: '创建组队失败' }, 500)
  }
})

// 更新组队信息
app.put('/api/teams/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const updates = await c.req.json()
    
    const db = drizzle(c.env.DB)
    
    await db.update(teams)
      .set(updates)
      .where(eq(teams.id, Number(id)))
      .run()

    return c.json({ success: true, message: '更新成功' })
  } catch (error) {
    return c.json({ error: '更新组队信息失败' }, 500)
  }
})

// 删除组队
app.delete('/api/teams/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = drizzle(c.env.DB)
    
    await db.delete(teams).where(eq(teams.id, Number(id))).run()

    return c.json({ success: true, message: '删除成功' })
  } catch (error) {
    return c.json({ error: '删除组队失败' }, 500)
  }
})

// ==================== 反馈相关 API ====================

// 提交月度反馈
app.post('/api/feedback', async (c) => {
  try {
    const { user_id, content, month } = await c.req.json()
    
    if (!user_id || !content || !month) {
      return c.json({ error: '用户ID、内容和月份不能为空' }, 400)
    }

    const db = drizzle(c.env.DB)
    
    const result = await db.insert(feedback).values({
      user_id,
      content,
      month, // 格式: 2025-01
      created_at: new Date()
    }).run()

    return c.json({ 
      success: true, 
      feedbackId: result.meta.last_row_id,
      message: '反馈提交成功' 
    })
  } catch (error) {
    return c.json({ error: '提交反馈失败' }, 500)
  }
})

// 获取用户的反馈历史
app.get('/api/feedback/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const db = drizzle(c.env.DB)
    
    const userFeedback = await db.select()
      .from(feedback)
      .where(eq(feedback.user_id, Number(userId)))
      .orderBy(desc(feedback.created_at))
      .all()

    return c.json(userFeedback)
  } catch (error) {
    return c.json({ error: '获取反馈历史失败' }, 500)
  }
})

// 获取某个月的所有反馈
app.get('/api/feedback/month/:month', async (c) => {
  try {
    const month = c.req.param('month')
    const db = drizzle(c.env.DB)
    
    const monthFeedback = await db.select()
      .from(feedback)
      .where(eq(feedback.month, month))
      .orderBy(desc(feedback.created_at))
      .all()

    return c.json(monthFeedback)
  } catch (error) {
    return c.json({ error: '获取月度反馈失败' }, 500)
  }
})

export default app