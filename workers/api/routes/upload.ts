import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'
import type { Bindings } from '../types'

const uploadRouter = new Hono<{ Bindings: Bindings }>()

// 允许的图片类型
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * 上传图片到 R2
 * POST /api/upload/image
 */
uploadRouter.post('/image', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return c.json({ error: '未提供文件' }, 400)
    }

    // 验证文件类型
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return c.json({ error: '不支持的文件类型，仅允许 JPEG、PNG、WebP、GIF' }, 400)
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return c.json({ error: '文件过大，最大支持 5MB' }, 400)
    }

    // 生成唯一的文件名
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 10)
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `forum/${user.id}/${timestamp}-${random}.${ext}`

    // 上传到 R2
    const arrayBuffer = await file.arrayBuffer()
    await c.env.ASSETS.put(filename, arrayBuffer, {
      customMetadata: {
        userId: user.id.toString(),
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
      },
      httpMetadata: {
        contentType: file.type,
      },
    })

    // 生成公开 URL
    // 判断是否为本地开发环境（通过检查是否有 R2_PUBLIC_URL 环境变量）
    const isLocalDev = !c.env.R2_PUBLIC_URL
    let imageUrl: string
    if (isLocalDev) {
      // 本地开发：使用本地 API 路由提供图片
      // 从请求头中获取 origin，自动适配不同端口
      const origin = new URL(c.req.url).origin
      imageUrl = `${origin}/api/upload/serve/${filename}`
    } else {
      // 生产环境：使用 R2 公开 URL
      const publicUrl = c.env.R2_PUBLIC_URL
      imageUrl = `${publicUrl}/${filename}`
    }

    return c.json({
      success: true,
      url: imageUrl,
      filename: filename,
    }, 201)
  } catch (error) {
    console.error('上传图片错误:', error)
    return c.json({ error: '上传失败，请重试' }, 500)
  }
})

/**
 * 删除图片（仅允许上传者或管理员删除）
 * DELETE /api/upload/image/*
 */
uploadRouter.delete('/image/*', authMiddleware, async (c) => {
  try {
    const user = c.get('user')
    // 获取完整路径，移除 /api/upload/image/ 前缀
    const fullPath = c.req.path
    const filename = fullPath.replace('/api/upload/image/', '')

    if (!filename) {
      return c.json({ error: '未提供文件名' }, 400)
    }

    // 验证文件所有权（文件名中包含用户ID）
    if (!filename.includes(`forum/${user.id}/`)) {
      return c.json({ error: '无权删除此文件' }, 403)
    }

    // 从 R2 删除
    await c.env.ASSETS.delete(filename)

    return c.json({
      success: true,
      message: '图片已删除',
    })
  } catch (error) {
    console.error('删除图片错误:', error)
    return c.json({ error: '删除失败，请重试' }, 500)
  }
})

/**
 * 提供本地 R2 图片服务（仅用于本地开发）
 * GET /api/upload/serve/*
 */
uploadRouter.get('/serve/*', async (c) => {
  try {
    // 获取完整路径，移除 /api/upload/serve/ 前缀
    const fullPath = c.req.path
    const filename = fullPath.replace('/api/upload/serve/', '')

    if (!filename) {
      return c.json({ error: '未提供文件名' }, 400)
    }

    // 从 R2 获取文件
    const object = await c.env.ASSETS.get(filename)

    if (!object) {
      return c.json({ error: '文件不存在' }, 404)
    }

    // 获取文件内容和元数据
    const data = await object.arrayBuffer()
    const contentType = object.httpMetadata?.contentType || 'application/octet-stream'

    // 返回图片
    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('获取图片错误:', error)
    return c.json({ error: '获取图片失败' }, 500)
  }
})

export default uploadRouter
