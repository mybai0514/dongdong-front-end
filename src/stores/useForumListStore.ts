/**
 * 论坛列表状态管理 Store
 * 使用 Zustand + sessionStorage 持久化
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ForumPost, ForumCategory } from '@/types'

interface ForumListState {
  // 分类信息
  category: ForumCategory | null
  categorySlug: string

  // 列表数据
  posts: ForumPost[]
  total: number
  totalPages: number

  // 查询参数
  currentPage: number
  searchQuery: string
  sortBy: 'latest' | 'views' | 'likes'

  // UI 状态
  loading: boolean

  // Actions
  setCategory: (category: ForumCategory | null) => void
  setCategorySlug: (slug: string) => void
  setPosts: (posts: ForumPost[], total: number, totalPages: number) => void
  setPage: (page: number) => void
  setSearch: (query: string) => void
  setSortBy: (sort: 'latest' | 'views' | 'likes') => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

const initialState = {
  category: null,
  categorySlug: '',
  posts: [],
  total: 0,
  totalPages: 1,
  currentPage: 1,
  searchQuery: '',
  sortBy: 'latest' as const,
  loading: false,
}

export const useForumListStore = create<ForumListState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCategory: (category) => set({ category }),

      setCategorySlug: (slug) => {
        // 如果切换到不同的分类，重置状态
        if (get().categorySlug !== slug) {
          set({
            ...initialState,
            categorySlug: slug,
          })
        } else {
          set({ categorySlug: slug })
        }
      },

      setPosts: (posts, total, totalPages) =>
        set({ posts, total, totalPages, loading: false }),

      setPage: (page) => set({ currentPage: page }),

      setSearch: (query) =>
        set({
          searchQuery: query,
          currentPage: 1, // 搜索时重置到第一页
        }),

      setSortBy: (sort) =>
        set({
          sortBy: sort,
          currentPage: 1, // 排序时重置到第一页
        }),

      setLoading: (loading) => set({ loading }),

      reset: () => set(initialState),
    }),
    {
      name: 'forum-list-storage', // sessionStorage key
      storage: createJSONStorage(() => sessionStorage),
      // 只持久化必要的状态，不持久化 loading 等瞬时状态
      partialize: (state) => ({
        categorySlug: state.categorySlug,
        currentPage: state.currentPage,
        searchQuery: state.searchQuery,
        sortBy: state.sortBy,
      }),
    }
  )
)
