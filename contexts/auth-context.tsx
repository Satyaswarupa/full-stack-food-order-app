'use client'

import { createContext, useContext, useCallback, ReactNode, useEffect, useState } from 'react'
import useSWR from 'swr'

interface Address {
  _id?: string
  label: string
  mobile: string
  fullAddress: string
  lat?: number
  lng?: number
  isDefault: boolean
}

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  addresses?: Address[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const { data, isLoading: swrLoading, mutate } = useSWR(
    isClient ? '/api/auth/me' : null, 
    fetcher
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: data.error || 'Login failed' }
    }

    mutate()
    return {}
  }, [mutate])

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: data.error || 'Signup failed' }
    }

    mutate()
    return {}
  }, [mutate])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    mutate({ user: null }, false)
  }, [mutate])

  const refreshUser = useCallback(() => {
    mutate()
  }, [mutate])

  const isLoading = !isClient || swrLoading

  return (
    <AuthContext.Provider value={{
      user: data?.user || null,
      isLoading,
      login,
      signup,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
