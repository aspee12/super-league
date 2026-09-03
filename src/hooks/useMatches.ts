'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMatches, type PayloadMatch, type PayloadTeam } from '@/lib/matches-api'
import { computeMatchStatus } from '@/lib/match-status'
import { useSeasons } from './useSeasons'
import type { Match, Team } from '@app-types/matchTypes'

function toTeam(val: string | PayloadTeam): Team {
  if (typeof val === 'string') {
    return { id: val, name: 'Unknown', logo: '' }
  }
  return { id: val.id, name: val.name, logo: val.logo ?? '' }
}

function toMatch(doc: PayloadMatch): Match {
  const status = computeMatchStatus(doc.status, doc.date, doc.time)
  return {
    id: doc.id,
    teamA: toTeam(doc.teamA),
    teamB: toTeam(doc.teamB),
    scoreA: doc.scoreA,
    scoreB: doc.scoreB,
    date: doc.date,
    time: doc.time,
    status,
    playerStats: doc.playerStats,
  }
}

export function useMatches() {
  const { viewingSeasonId, isReady } = useSeasons()

  const query = useQuery({
    // Season is part of the key so switching seasons refetches rather than
    // showing the previous season's fixtures.
    queryKey: ['matches', viewingSeasonId ?? null],
    queryFn: () => getMatches(viewingSeasonId),
    // Wait for the season list, otherwise the first fetch would be unscoped.
    enabled: isReady,
    // Adaptive polling: 15s when live matches exist, 2min otherwise.
    // TanStack Query v5 supports a function for refetchInterval that
    // receives the current query state — we inspect the cached data to decide.
    refetchInterval: (query) => {
      const docs = query.state.data as PayloadMatch[] | undefined
      if (!docs) return 30_000
      const hasLive = docs.some(
        (d) => computeMatchStatus(d.status, d.date, d.time) === 'live',
      )
      return hasLive ? 15_000 : 120_000
    },
  })

  const matches = useMemo(
    () => (query.data ?? []).map(toMatch),
    [query.data],
  )

  const liveMatches = useMemo(
    () => matches.filter((m) => m.status === 'live'),
    [matches],
  )

  const upcomingMatches = useMemo(
    () =>
      matches
        .filter((m) => m.status === 'upcoming')
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`)
          const dateB = new Date(`${b.date}T${b.time}`)
          return dateA.getTime() - dateB.getTime()
        })
        .slice(0, 2),
    [matches],
  )

  const recentMatches = useMemo(
    () => matches.filter((m) => m.status === 'finished').slice(0, 3),
    [matches],
  )

  const allResults = useMemo(
    () =>
      matches
        .filter((m) => m.status === 'finished')
        .sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`)
          const dateB = new Date(`${b.date}T${b.time}`)
          return dateB.getTime() - dateA.getTime()
        }),
    [matches],
  )

  return {
    ...query,
    matches,
    liveMatches,
    upcomingMatches,
    recentMatches,
    allResults,
  }
}
