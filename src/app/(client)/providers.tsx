'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays "fresh" for 60s — no refetch triggered if a
            // component remounts within this window.
            staleTime: 60_000,
            // Keep unused query data in memory for 5 minutes so navigating
            // back to a page shows cached data instantly instead of a spinner.
            gcTime: 5 * 60_000,
            // Only retry failed fetches once (default is 3) to surface
            // errors faster during development and reduce wasted requests.
            retry: 1,
            // Don't refetch just because the browser tab regained focus —
            // the per-hook refetchInterval already keeps data up to date.
            refetchOnWindowFocus: false,
          },
        },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
