import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc } from 'drizzle-orm'
import { feedback } from '../../../db/schema'
import type { Bindings } from '../types'

const feedbackRouter = new Hono<{ Bindings: Bindings }>()

// 提交月度反馈
feedbackRouter.post('/', async (c) => {
  try {
    const { user_id, content, month, game, mood } = await c.req.json()

    if (!user_id || !content || !month) {
      return c.json({ error: '用户ID、内容和月份不能为空' }, 400)
    }

    const db = drizzle(c.env.DB)

    const result = await db.insert(feedback).values({
      user_id,
      content,
      month,
      game,
      mood,
      created_at: new Date()
    }).run()

    return c.json({
      success: true,
      feedbackId: result.meta.last_row_id,
      message: '反馈提交成功'
    })
  } catch (error) {
    console.error('提交反馈错误:', error)
    return c.json({ error: '提交反馈失败' }, 500)
  }
})

// 获取用户的反馈历史
feedbackRouter.get('/user/:userId', async (c) => {
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
    console.error('获取反馈历史错误:', error)
    return c.json({ error: '获取反馈历史失败' }, 500)
  }
})

// 获取某个月的所有反馈
feedbackRouter.get('/month/:month', async (c) => {
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
    console.error('获取月度反馈错误:', error)
    return c.json({ error: '获取月度反馈失败' }, 500)
  }
})

export default feedbackRouter
