'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Clock,
  Users,
  MessageCircle,
  Gamepad2,
  Crown,
  UserPlus,
  Loader2,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  getUserTeams,
  getJoinedTeams,
  getTeamMembers,
  ApiError
} from '@/lib/api'
import { useAuth } from '@/hooks'
import type { Team, TeamMember } from '@/types'
import { GAMES_WITH_ALL } from '@/lib/constants'

export default function HistoryPage() {
  const { user, loading } = useAuth({
    redirectTo: '/login',
  })

  const [myTeams, setMyTeams] = useState<Team[]>([])
  const [joinedTeams, setJoinedTeams] = useState<Team[]>([])
  const [loadingMyTeams, setLoadingMyTeams] = useState(true)
  const [loadingJoinedTeams, setLoadingJoinedTeams] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGame, setSelectedGame] = useState('全部')
  const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created')

  // 队伍详情弹窗状态
  const [membersDialog, setMembersDialog] = useState<{
    open: boolean
    teamId?: number
    teamTitle?: string
    teamDescription?: string
    members?: TeamMember[]
    loading?: boolean
  }>({ open: false })

  useEffect(() => {
    if (user) {
      fetchMyTeams(user.id)
      fetchJoinedTeamsList()
    }
  }, [user])

  const fetchMyTeams = async (userId: number) => {
    setLoadingMyTeams(true)
    try {
      const data = await getUserTeams(userId)
      setMyTeams(data)
    } catch (error) {
      console.error('获取我的队伍失败:', error)
    } finally {
      setLoadingMyTeams(false)
    }
  }

  const fetchJoinedTeamsList = async () => {
    setLoadingJoinedTeams(true)
    try {
      const data = await getJoinedTeams()
      setJoinedTeams(data)
    } catch (error) {
      console.error('获取加入的队伍失败:', error)
    } finally {
      setLoadingJoinedTeams(false)
    }
  }

  const showMembers = async (teamId: number, teamTitle: string, teamDescription?: string) => {
    setMembersDialog({
      open: true,
      teamId,
      teamTitle,
      teamDescription,
      loading: true
    })

    try {
      const members = await getTeamMembers(teamId)
      setMembersDialog({
        open: true,
        teamId,
        teamTitle,
        teamDescription,
        members,
        loading: false
      })
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message || '获取队伍信息失败')
      } else {
        alert('网络错误，请稍后重试')
      }
      console.error('获取队伍信息错误:', err)
      setMembersDialog({ open: false })
    }
  }

  const isTeamCompleted = (endTime: string) => {
    const now = new Date()
    const end = new Date(endTime)
    return end < now
  }

  const getContactIcon = (method: string) => {
    switch (method) {
      case 'wechat': return '微信'
      case 'qq': return 'QQ'
      case 'yy': return 'YY'
      default: return '联系方式'
    }
  }

  // 筛选已完成的队伍
  const completedMyTeams = myTeams.filter(team => isTeamCompleted(team.end_time))
  const completedJoinedTeams = joinedTeams.filter(team => isTeamCompleted(team.end_time))

  // 应用搜索和游戏筛选
  const filteredMyTeams = completedMyTeams.filter(team => {
    const matchSearch = team.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       team.description?.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchSearch) return false
    if (selectedGame !== '全部' && team.game !== selectedGame) return false
    return true
  })

  const filteredJoinedTeams = completedJoinedTeams.filter(team => {
    const matchSearch = team.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       team.description?.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchSearch) return false
    if (selectedGame !== '全部' && team.game !== selectedGame) return false
    return true
  })

  const currentTeams = activeTab === 'created' ? filteredMyTeams : filteredJoinedTeams
  const currentLoading = activeTab === 'created' ? loadingMyTeams : loadingJoinedTeams

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">历史组队</h1>
        <p className="text-muted-foreground">
          查看你的历史组队记录
        </p>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'created' ? 'default' : 'outline'}
          onClick={() => setActiveTab('created')}
        >
          <Crown className="mr-2 h-4 w-4" />
          我发起的 ({completedMyTeams.length})
        </Button>
        <Button
          variant={activeTab === 'joined' ? 'default' : 'outline'}
          onClick={() => setActiveTab('joined')}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          我加入的 ({completedJoinedTeams.length})
        </Button>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索组队标题或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedGame} onValueChange={setSelectedGame}>
          <SelectTrigger className="w-full md:w-50">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="选择游戏" />
          </SelectTrigger>
          <SelectContent>
            {GAMES_WITH_ALL.map(game => (
              <SelectItem key={game} value={game}>
                {game}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 队伍列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {activeTab === 'created' ? '我发起的历史组队' : '我加入的历史组队'}
          </CardTitle>
          <CardDescription>
            已完成的组队记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : currentTeams.length === 0 ? (
            <div className="text-center py-8">
              <Gamepad2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || selectedGame !== '全部' 
                  ? '没有找到符合条件的历史记录' 
                  : '暂无历史组队记录'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentTeams.map(team => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{team.game}</Badge>
                      <Badge variant="secondary">已完成</Badge>
                    </div>
                    <h4 className="font-medium truncate">{team.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {team.member_count}/{team.max_members}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(team.start_time).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(team.end_time).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {activeTab === 'joined' && team.contact_method && team.contact_value && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        <span>{getContactIcon(team.contact_method)}: {team.contact_value}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showMembers(team.id, team.title, team.description || undefined)}
                    >
                      <Users className="mr-1 h-3 w-3" />
                      查看队伍
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 队伍详情弹窗 */}
      <Dialog open={membersDialog.open} onOpenChange={(open) => setMembersDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              队伍详情
            </DialogTitle>
            <DialogDescription>
              {membersDialog.teamTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {membersDialog.loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
              </div>
            ) : (
              <>
                {membersDialog.teamDescription && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-semibold mb-1">队伍描述</h4>
                    <p className="text-sm text-muted-foreground">{membersDialog.teamDescription}</p>
                  </div>
                )}
                <div className="mb-2">
                  <h4 className="text-sm font-semibold mb-2">队友列表</h4>
                  {membersDialog.members && membersDialog.members.length > 0 ? (
                    <div className="space-y-2">
                      {membersDialog.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-primary">
                                {member.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{member.username}</p>
                                {member.isCreator && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Crown className="h-3 w-3 mr-1" />
                                    队长
                                  </Badge>
                                )}
                              </div>
                              {member.joined_at && (
                                <p className="text-xs text-muted-foreground">
                                  加入于 {new Date(member.joined_at).toLocaleString('zh-CN', {
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">暂无队友信息</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setMembersDialog({ open: false })}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
