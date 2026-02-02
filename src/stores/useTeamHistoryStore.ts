/**
 * 历史组队状态管理 Store
 * 使用 Zustand (内存存储，离开页面自动清除)
 */

import { create } from 'zustand'
import type { Team } from '@/types'

interface TeamHistoryState {
  // 我创建的队伍
  myTeams: Team[]

  // 我加入的队伍
  joinedTeams: Team[]

  // 查询参数
  searchQuery: string
  selectedGame: string
  activeTab: 'created' | 'joined'

  // UI 状态
  loadingMyTeams: boolean
  loadingJoinedTeams: boolean

  // Actions
  setMyTeams: (teams: Team[]) => void
  setJoinedTeams: (teams: Team[]) => void
  setSearch: (query: string) => void
  setSelectedGame: (game: string) => void
  setActiveTab: (tab: 'created' | 'joined') => void
  setLoadingMyTeams: (loading: boolean) => void
  setLoadingJoinedTeams: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  myTeams: [],
  joinedTeams: [],
  searchQuery: '',
  selectedGame: '全部',
  activeTab: 'created' as const,
  loadingMyTeams: false,
  loadingJoinedTeams: false,
}

export const useTeamHistoryStore = create<TeamHistoryState>((set) => ({
  ...initialState,

  setMyTeams: (teams) =>
    set({ myTeams: teams, loadingMyTeams: false }),

  setJoinedTeams: (teams) =>
    set({ joinedTeams: teams, loadingJoinedTeams: false }),

  setSearch: (query) =>
    set({ searchQuery: query }),

  setSelectedGame: (game) =>
    set({ selectedGame: game }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setLoadingMyTeams: (loading) => set({ loadingMyTeams: loading }),

  setLoadingJoinedTeams: (loading) => set({ loadingJoinedTeams: loading }),

  reset: () => set(initialState),
}))
