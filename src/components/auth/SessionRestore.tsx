'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { me } from '@/lib/auth-api'
import { onAuthFailure } from '@/lib/api-client'
import { useAuthStore } from '@/store/authStore'

/**
 * How often to re-check a live session. The auth cookie outlives this, so an
 * idle tab notices an expiry within a few minutes instead of waiting for the
 * user to click something that then fails.
 */
const SESSION_POLL_MS = 5 * 60_000

/**
 * Restores the session on load and ends it the moment it lapses.
 *
 * The store is persisted to localStorage, so without this the UI would keep
 * showing a signed-in user — and admin-only controls — long after the cookie
 * behind it had expired. Signing out is left in place rather than redirecting:
 * every route here is publicly readable, so the page simply drops to its
 * signed-out state.
 */
export function SessionRestore() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  const hasUser = useAuthStore((s) => s.user !== null)

  const { data, isFetched } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => me(),
    staleTime: 5 * 60 * 1000,
    retry: false,
    // Only poll while we believe there's a session to lose — anonymous
    // visitors shouldn't generate background traffic.
    refetchOnWindowFocus: hasUser,
    refetchInterval: hasUser ? SESSION_POLL_MS : false,
  })

  const endSession = useCallback(() => {
    // Read through `getState` rather than the subscribed value: this runs from
    // async callbacks where the closed-over value may be stale.
    if (!useAuthStore.getState().user) return
    setUser(null)
    // Drop cached data fetched as the signed-in user.
    queryClient.clear()
    toast.error('Your session has expired. Please sign in again.')
  }, [setUser, queryClient])

  // Sync the store to whatever `/users/me` says.
  useEffect(() => {
    if (!isFetched) return
    if (data) {
      setUser({
        id: data.id,
        email: data.email,
        role: data.role as 'super_admin' | 'admin' | 'user',
        permissions: data.permissions ?? undefined,
      })
    } else if (useAuthStore.getState().user) {
      endSession()
    } else {
      setUser(null)
    }
  }, [data, isFetched, setUser, endSession])

  // A request rejected mid-session is the fastest signal that the cookie is
  // gone. Confirm against `/users/me` first: Payload also answers 403 when a
  // perfectly valid session simply lacks permission for that action, and
  // logging those users out would be wrong.
  const revalidating = useRef(false)
  useEffect(
    () =>
      onAuthFailure(() => {
        if (revalidating.current) return
        if (!useAuthStore.getState().user) return
        revalidating.current = true
        me()
          .then((u) => {
            if (!u) endSession()
          })
          .catch(() => {
            // Network blip, not an expiry — leave the session alone.
          })
          .finally(() => {
            revalidating.current = false
          })
      }),
    [endSession],
  )

  return null
}
