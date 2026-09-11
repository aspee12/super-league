'use client'

import { ChevronLeft, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { TeamLogo } from '@shared-component/TeamLogo'
import { FullPageLoader } from '@shared-component/FullPageLoader'
import { ListPagination, paginate } from '@shared-component/ListPagination'
import { ExpandedMatchStats } from '@shared-component/ExpandedMatchStats'
import { useMatches } from '@/hooks/useMatches'

/** A full season can run to 100+ fixtures — page them rather than one long scroll. */
const PAGE_SIZE = 10


export function MobileAllResultsView() {
  const { allResults, isLoading } = useMatches()
  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({})
  const [page, setPage] = useState(1)
  const { pageCount, safePage, visible, summary } = paginate(allResults, page, PAGE_SIZE)

  const toggleStats = (matchId: string) => {
    setExpandedStats((prev) => ({ ...prev, [matchId]: !prev[matchId] }))
  }

  if (isLoading) {
    return <FullPageLoader message="Loading results..." />
  }

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-4 mb-2">
        <Link
          href="/matches"
          className="inline-flex items-center gap-1 text-[#0e7490] text-sm font-medium"
        >
          <ChevronLeft size={16} />
          Back to Matches
        </Link>
      </div>

      <div className="px-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">All Results</h2>

        {allResults.length > 0 ? (
          <div className="space-y-3">
            {visible.map((match) => {
              const isExpanded = expandedStats[match.id]

              return (
                <div key={match.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className="mb-1.5">
                        <TeamLogo
                          logo={match.teamA.logo || '⚽'}
                          name={match.teamA.name}
                          className="w-8 h-8"
                          textClassName="text-2xl"
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-800 text-center px-1 line-clamp-2">
                        {match.teamA.name}
                      </span>
                    </div>

                    <div className="flex flex-col items-center shrink-0 px-1">
                      <div className="bg-[#0e7490] text-white px-3 py-1.5 rounded-md">
                        <div className="text-sm font-bold whitespace-nowrap">
                          {match.scoreA}-{match.scoreB}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">{match.date}</div>
                    </div>

                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className="mb-1.5">
                        <TeamLogo
                          logo={match.teamB.logo || '⚽'}
                          name={match.teamB.name}
                          className="w-8 h-8"
                          textClassName="text-2xl"
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-800 text-center px-1 line-clamp-2">
                        {match.teamB.name}
                      </span>
                    </div>
                  </div>

                  {(match.playerStats ?? []).length > 0 && (
                    <div className="border-t border-gray-100 mt-3 pt-2">
                      <ExpandedMatchStats
                        stats={
                          isExpanded
                            ? (match.playerStats ?? [])
                            : (match.playerStats ?? []).slice(0, 2)
                        }
                        teamAId={match.teamA.id}
                        teamBId={match.teamB.id}
                      />
                      {(match.playerStats ?? []).length > 2 && (
                        <button
                          onClick={() => toggleStats(match.id)}
                          className="text-[#0e7490] mt-1"
                          aria-label={isExpanded ? 'Show less' : 'Show all'}
                        >
                          {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            <ListPagination
              page={safePage}
              pageCount={pageCount}
              onPageChange={setPage}
              summary={summary}
            />
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm py-8">No results yet</p>
        )}
      </div>
    </div>
  )
}
