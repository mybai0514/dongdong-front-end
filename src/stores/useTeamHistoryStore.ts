/**
 * 历史组队状态管理 Store
 * 使用 Zustand + sessionStorage 持久化
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Team } from '@/types'

interface TeamHistoryState {
  // 我创建的队伍
  myTeams: Team[]
  myTeamsPage: number
  myTotalPages: number

  // 我加入的队伍
  joinedTeams: Team[]
  joinedTeamsPage: number
  joinedTotalPages: number

  // 查询参数
  searchQuery: string
  selectedGame: string
  activeTab: 'created' | 'joined'

  // UI 状态
  loadingMyTeams: boolean
  loadingJoinedTeams: boolean

  // Actions
  setMyTeams: (teams: Team[], totalPages: number) => void
  setJoinedTeams: (teams: Team[], totalPages: number) => void
  setMyTeamsPage: (page: number) => void
  setJoinedTeamsPage: (page: number) => void
  setSearch: (query: string) => void
  setSelectedGame: (game: string) => void
  setActiveTab: (tab: 'created' | 'joined') => void
  setLoadingMyTeams: (loading: boolean) => void
  setLoadingJoinedTeams: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  myTeams: [],
  myTeamsPage: 1,
  myTotalPages: 1,
  joinedTeams: [],
  joinedTeamsPage: 1,
  joinedTotalPages: 1,
  searchQuery: '',
  selectedGame: '全部',
  activeTab: 'created' as const,
  loadingMyTeams: false,
  loadingJoinedTeams: false,
}

export const useTeamHistoryStore = create<TeamHistoryState>()(
  persist(
    (set) => ({
      ...initialState,

      setMyTeams: (teams, totalPages) =>
        set({ myTeams: teams, myTotalPages: totalPages, loadingMyTeams: false }),

      setJoinedTeams: (teams, totalPages) =>
        set({
          joinedTeams: teams,
          joinedTotalPages: totalPages,
          loadingJoinedTeams: false,
        }),

      setMyTeamsPage: (page) => set({ myTeamsPage: page }),

      setJoinedTeamsPage: (page) => set({ joinedTeamsPage: page }),

      setSearch: (query) =>
        set({
          searchQuery: query,
          myTeamsPage: 1, // 搜索时重置到第一页
          joinedTeamsPage: 1,
        }),

      setSelectedGame: (game) =>
        set({
          selectedGame: game,
          myTeamsPage: 1, // 筛选时重置到第一页
          joinedTeamsPage: 1,
        }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setLoadingMyTeams: (loading) => set({ loadingMyTeams: loading }),

      setLoadingJoinedTeams: (loading) => set({ loadingJoinedTeams: loading }),

      reset: () => set(initialState),
    }),
    {
      name: 'team-history-storage', // sessionStorage key
      storage: createJSONStorage(() => sessionStorage),
      // 只持久化必要的状态
      partialize: (state) => ({
        myTeamsPage: state.myTeamsPage,
        joinedTeamsPage: state.joinedTeamsPage,
        searchQuery: state.searchQuery,
        selectedGame: state.selectedGame || '全部', // 防止空值
        activeTab: state.activeTab,
      }),
      // 从 sessionStorage 恢复时，修复空值问题
      onRehydrateStorage: () => (state) => {
        if (state && !state.selectedGame) {
          state.selectedGame = '全部'
        }
      },
    }
  )
)
