/**
 * 队伍列表状态管理 Store
 * 使用 Zustand + sessionStorage 持久化
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Team } from '@/types'

interface TeamsListState {
  // 列表数据
  teams: Team[]
  total: number
  totalPages: number

  // 查询参数
  currentPage: number
  searchQuery: string
  selectedGame: string
  selectedDate: string

  // UI 状态
  loading: boolean
  joiningTeamId: number | null

  // Actions
  setTeams: (teams: Team[], total: number, totalPages: number) => void
  setPage: (page: number) => void
  setSearch: (query: string) => void
  setSelectedGame: (game: string) => void
  setSelectedDate: (date: string) => void
  setLoading: (loading: boolean) => void
  setJoiningTeamId: (id: number | null) => void
  reset: () => void
}

const initialState = {
  teams: [],
  total: 0,
  totalPages: 1,
  currentPage: 1,
  searchQuery: '',
  selectedGame: '全部',
  selectedDate: '',
  loading: false,
  joiningTeamId: null,
}

export const useTeamsListStore = create<TeamsListState>()(
  persist(
    (set) => ({
      ...initialState,

      setTeams: (teams, total, totalPages) =>
        set({ teams, total, totalPages, loading: false }),

      setPage: (page) => set({ currentPage: page }),

      setSearch: (query) =>
        set({
          searchQuery: query,
          currentPage: 1, // 搜索时重置到第一页
        }),

      setSelectedGame: (game) =>
        set({
          selectedGame: game,
          currentPage: 1, // 筛选时重置到第一页
        }),

      setSelectedDate: (date) =>
        set({
          selectedDate: date,
          currentPage: 1, // 筛选时重置到第一页
        }),

      setLoading: (loading) => set({ loading }),

      setJoiningTeamId: (id) => set({ joiningTeamId: id }),

      reset: () => set(initialState),
    }),
    {
      name: 'teams-list-storage', // sessionStorage key
      storage: createJSONStorage(() => sessionStorage),
      // 只持久化必要的状态
      partialize: (state) => ({
        currentPage: state.currentPage,
        searchQuery: state.searchQuery,
        selectedGame: state.selectedGame || '全部', // 防止空值
        selectedDate: state.selectedDate,
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
