'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { MatchCard } from '@shared-component/MatchCard'
import { FullPageLoader } from '@shared-component/FullPageLoader'
import { useMatches } from '@/hooks/useMatches'

export function AllResultsView() {
  const { allResults, isLoading } = useMatches()

  if (isLoading) {
    return <FullPageLoader message="Loading results..." />
  }

  return (
    <div className="min-h-screen flex-1 p-6">
      <div className="mb-4">
        <Link
          href="/matches"
          className="inline-flex items-center gap-1 text-[#0e7490] hover:underline text-sm"
        >
          <ChevronLeft size={16} />
          Back to Matches
        </Link>
      </div>

      <div className="bg-[#c5e6d4] rounded-t-lg px-6 py-3">
        <h2 className="font-semibold text-[#0c5273]">All Results</h2>
      </div>

      {allResults.length > 0 ? (
        <div className="space-y-4 mt-4">
          {allResults.map((match) => (
            <MatchCard key={match.id} match={match} variant="result" />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">No results yet</div>
      )}
    </div>
  )
}
