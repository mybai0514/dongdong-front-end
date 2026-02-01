'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { MessageSquare, Eye, ThumbsUp, Clock, Search, Plus, TrendingUp, Loader2, Pin } from 'lucide-react'
import { formatTimeForDisplay } from '@/lib/time'
import { useUser } from '@/hooks'
import { Textarea } from '@/components/ui/textarea'
import { getForumPosts, createForumPost } from '@/lib/api'
import type { ForumCategory, ForumPost } from '@/types'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const user = useUser()
  const categorySlug = params.slug as string

  const [category, setCategory] = useState<ForumCategory | null>(null)
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'likes'>('latest')

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const itemsPerPage = 12

  // 发帖对话框
  const [createPostDialog, setCreatePostDialog] = useState(false)
  const [newPostTitle, setNewPostTitle] = useState('')
  const [newPostContent, setNewPostContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [categorySlug, currentPage, sortBy, searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const data = await getForumPosts(categorySlug, {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        search: searchQuery || undefined
      })

      setPosts(data.posts || [])
      setCategory(data.category || null)
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('获取帖子列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!user) {
      router.push(`/login?redirect=/forum/${categorySlug}`)
      return
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      alert('标题和内容不能为空')
      return
    }

    if (newPostTitle.length > 200) {
      alert('标题不能超过200个字符')
      return
    }

    if (newPostContent.length > 10000) {
      alert('内容不能超过10000个字符')
      return
    }

    setSubmitting(true)
    try {
      const data = await createForumPost(categorySlug, {
        title: newPostTitle.trim(),
        content: newPostContent.trim()
      })

      // 关闭对话框并重置表单
      setCreatePostDialog(false)
      setNewPostTitle('')
      setNewPostContent('')

      // 跳转到新帖子详情页
      router.push(`/forum/${categorySlug}/${data.post.id}`)
    } catch (error: any) {
      console.error('发布帖子失败:', error)
      alert(error.message || '发布帖子失败')
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryColor = (slug: string) => {
    if (slug === 'lusty') {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-700',
        button: 'bg-orange-500 hover:bg-orange-600'
      }
    } else if (slug === 'fishy') {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700',
        button: 'bg-blue-500 hover:bg-blue-600'
      }
    }
    return {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-600',
      badge: 'bg-gray-100 text-gray-700',
      button: 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const colors = category ? getCategoryColor(category.slug) : getCategoryColor('')

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading && !category) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">分类不存在</h3>
          <Link href="/forum">
            <Button>返回论坛首页</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 分类标题 */}
      <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6 mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`text-5xl ${colors.text}`}>
              {category.icon || '💬'}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
              <p className="text-muted-foreground">{category.description || '暂无描述'}</p>
              <Badge variant="secondary" className={`${colors.badge} mt-2`}>
                {category.post_count} 个帖子
              </Badge>
            </div>
          </div>
          <Button
            onClick={() => {
              if (!user) {
                router.push(`/login?redirect=/forum/${categorySlug}`)
                return
              }
              setCreatePostDialog(true)
            }}
            className={colors.button}
          >
            <Plus className="h-4 w-4 mr-2" />
            发布帖子
          </Button>
        </div>
      </div>

      {/* 搜索和排序 */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索帖子标题或内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'latest' | 'views' | 'likes')}>
          <SelectTrigger className="w-full sm:w-45">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">最新发布</SelectItem>
            <SelectItem value="views">浏览最多</SelectItem>
            <SelectItem value="likes">点赞最多</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 帖子列表 - 卡片网格布局 */}
      {loading ? (
        <div className="flex items-center justify-center min-h-100">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">暂无帖子</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? '没有找到匹配的帖子' : '成为第一个发帖的人吧！'}
          </p>
          {!searchQuery && (
            <Button onClick={() => {
              if (!user) {
                router.push(`/login?redirect=/forum/${categorySlug}`)
                return
              }
              setCreatePostDialog(true)
            }}>
              <Plus className="h-4 w-4 mr-2" />
              发布帖子
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/forum/${categorySlug}/${post.id}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col">
                  <CardHeader className="flex-none">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-lg line-clamp-2 flex-1">
                        {post.is_pinned && (
                          <Pin className="inline h-4 w-4 mr-1 text-orange-500" />
                        )}
                        {post.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3 min-h-15">
                      {truncateText(post.content, 120)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">{post.author_username}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.created_at ? formatTimeForDisplay(post.created_at) : '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.comments_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {post.likes_count}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* 发帖对话框 */}
      <Dialog open={createPostDialog} onOpenChange={setCreatePostDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>发布新帖子</DialogTitle>
            <DialogDescription>
              在 {category.name} 分享你的想法
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">标题</label>
              <Input
                placeholder="输入帖子标题（最多200字符）"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {newPostTitle.length}/200
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">内容</label>
              <Textarea
                placeholder="输入帖子内容（最多10000字符）"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={12}
                maxLength={10000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {newPostContent.length}/10000
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePostDialog(false)} disabled={submitting}>
              取消
            </Button>
            <Button onClick={handleCreatePost} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  发布中...
                </>
              ) : (
                '发布'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
