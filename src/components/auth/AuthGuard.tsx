'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { me } from '@/lib/auth-api'
import { useAuthStore } from '@/store/authStore'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  const { data, isLoading, isFetched } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const u = await me()
      return u
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  useEffect(() => {
    if (!isFetched) return
    const u = data
    if (u) {
      setUser({
        id: u.id,
        email: u.email,
        role: u.role as 'super_admin' | 'admin' | 'user',
        permissions: u.permissions ?? undefined,
      })
    } else {
      setUser(null)
      router.replace('/login')
    }
  }, [data, isFetched, setUser, router])

  if (isLoading || !isFetched) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-[#605e5c]">Loading…</div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return <>{children}</>
}
