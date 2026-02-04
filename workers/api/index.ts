/// <reference types="@cloudflare/workers-types" />

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Bindings } from './types'

// 导入路由模块
import authRoutes from './routes/auth'
import usersRoutes from './routes/users'
import teamsRoutes from './routes/teams'
import feedbackRoutes from './routes/feedback'
import forumRoutes from './routes/forum'
import uploadRoutes from './routes/upload'

const app = new Hono<{ Bindings: Bindings }>()

// 允许跨域请求（让 Next.js 前端可以调用）
app.use('/*', cors())

// 健康检查
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 注册路由模块
app.route('/api/auth', authRoutes)
app.route('/api/users', usersRoutes)
app.route('/api/teams', teamsRoutes)
app.route('/api/feedback', feedbackRoutes)
app.route('/api/forum', forumRoutes)
app.route('/api/upload', uploadRoutes)

export default app
