'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, TrendingUp, Clock, Eye, ThumbsUp, ArrowRight } from 'lucide-react'
import { formatTimeForDisplay } from '@/lib/time'
import { getForumCategories } from '@/lib/api'
import type { ForumCategory } from '@/types'

interface RecentPost {
  id: number
  title: string
  content: string
  author_username: string
  author_avatar: string
  views_count: number
  comments_count: number
  likes_count: number
  created_at: string
  category_name: string
  category_slug: string
}

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchForumData()
  }, [])

  const fetchForumData = async () => {
    try {
      // 获取分类列表
      const data = await getForumCategories()
      setCategories(data.categories || [])

      // TODO: 获取最近帖子（暂时留空，后续实现）
      setRecentPosts([])
    } catch (error) {
      console.error('获取论坛数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (slug: string) => {
    if (slug === 'lusty') {
      return {
        bg: 'bg-orange-50 hover:bg-orange-100',
        border: 'border-orange-200',
        text: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-700'
      }
    } else if (slug === 'fishy') {
      return {
        bg: 'bg-blue-50 hover:bg-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700'
      }
    }
    return {
      bg: 'bg-gray-50 hover:bg-gray-100',
      border: 'border-gray-200',
      text: 'text-gray-600',
      badge: 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">游戏论坛</h1>
        <p className="text-muted-foreground">社区互动、话题讨论</p>
      </div>

      {/* 分类卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {categories.map((category) => {
          const colors = getCategoryColor(category.slug)
          return (
            <Link key={category.id} href={`/forum/${category.slug}`}>
              <Card className={`${colors.bg} ${colors.border} border-2 transition-all duration-200 hover:shadow-lg cursor-pointer h-full`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`text-5xl ${colors.text}`}>
                        {category.icon || '💬'}
                      </div>
                      <div>
                        <CardTitle className="text-2xl mb-2">{category.name}</CardTitle>
                        <CardDescription className="text-base">
                          {category.description || '暂无描述'}
                        </CardDescription>
                      </div>
                    </div>
                    <ArrowRight className={`${colors.text} h-6 w-6 shrink-0`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className={colors.badge}>
                      <MessageSquare className="h-3 w-3 mr-1" />
                      {category.post_count} 个帖子
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* 最近帖子 */}
      {recentPosts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              最近帖子
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/forum/${post.category_slug}/${post.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-1">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {post.content.substring(0, 150)}...
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{post.category_name}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>{post.author_username}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeForDisplay(post.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.comments_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {post.likes_count}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 空状态提示 */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">暂无论坛分类</h3>
          <p className="text-muted-foreground">请联系管理员添加论坛分类</p>
        </div>
      )}
    </div>
  )
}
