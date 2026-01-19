'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  getStoredUser,
  setStoredUser,
  logout as apiLogout,
} from '@/lib/api'
import type { User } from '@/types'

interface UseAuthOptions {
  /** 未登录时重定向的路径，设为 false 则不重定向 */
  redirectTo?: string | false
  /** 已登录时重定向的路径（用于登录/注册页面） */
  redirectIfAuthenticated?: string
}

interface UseAuthReturn {
  /** 当前用户信息 */
  user: User | null
  /** 是否正在加载用户信息 */
  loading: boolean
  /** 是否已认证 */
  isAuthenticated: boolean
  /** 登出函数 */
  logout: () => Promise<void>
  /** 刷新用户信息 */
  refreshUser: () => void
  /** 更新本地用户信息 */
  updateUser: (updates: Partial<User>) => void
}

/**
 * 认证 Hook
 *
 * @example
 * // 需要登录的页面
 * const { user, loading } = useAuth({ redirectTo: '/login' })
 *
 * @example
 * // 登录页面（已登录则跳转）
 * const { user } = useAuth({ redirectIfAuthenticated: '/' })
 *
 * @example
 * // 不需要强制登录的页面
 * const { user, isAuthenticated } = useAuth({ redirectTo: false })
 */
export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { redirectTo, redirectIfAuthenticated } = options
  const router = useRouter()
  const pathname = usePathname()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 刷新用户信息
  const refreshUser = useCallback(() => {
    const userData = getStoredUser<User>()
    setUser(userData)
    return userData
  }, [])

  // 更新本地用户信息
  const updateUser = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      setStoredUser(updatedUser)
    }
  }, [user])

  // 登出
  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('登出错误:', error)
    } finally {
      setUser(null)
      router.push('/login')
    }
  }, [router])

  // 初始化和监听用户状态变化
  useEffect(() => {
    const userData = refreshUser()
    setLoading(false)

    // 处理重定向逻辑
    if (!userData && redirectTo !== false && redirectTo) {
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`
      router.push(redirectUrl)
    } else if (userData && redirectIfAuthenticated) {
      router.push(redirectIfAuthenticated)
    }

    // 监听登录/登出事件
    const handleUserChange = () => {
      refreshUser()
    }

    window.addEventListener('user-login', handleUserChange)
    window.addEventListener('user-logout', handleUserChange)
    window.addEventListener('storage', handleUserChange)

    return () => {
      window.removeEventListener('user-login', handleUserChange)
      window.removeEventListener('user-logout', handleUserChange)
      window.removeEventListener('storage', handleUserChange)
    }
  }, [pathname, redirectTo, redirectIfAuthenticated, router, refreshUser])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
    updateUser,
  }
}

/**
 * 简单的认证检查 Hook（不处理重定向）
 */
export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getStoredUser<User>())

    const handleUserChange = () => {
      setUser(getStoredUser<User>())
    }

    window.addEventListener('user-login', handleUserChange)
    window.addEventListener('user-logout', handleUserChange)
    window.addEventListener('storage', handleUserChange)

    return () => {
      window.removeEventListener('user-login', handleUserChange)
      window.removeEventListener('user-logout', handleUserChange)
      window.removeEventListener('storage', handleUserChange)
    }
  }, [])

  return user
}
