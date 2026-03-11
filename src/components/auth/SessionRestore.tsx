'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { me } from '@/lib/auth-api'
import { useAuthStore } from '@/store/authStore'

/**
 * Fetches current user when cookie exists and syncs to auth store.
 * Does not redirect; table/teams/stats stay viewable without login.
 */
export function SessionRestore() {
  const setUser = useAuthStore((s) => s.setUser)

  const { data, isFetched } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => me(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  useEffect(() => {
    if (!isFetched) return
    if (data) {
      setUser({
        id: data.id,
        email: data.email,
        role: data.role as 'super_admin' | 'admin' | 'user',
        permissions: data.permissions ?? undefined,
      })
    } else {
      setUser(null)
    }
  }, [data, isFetched, setUser])

  return null
}
