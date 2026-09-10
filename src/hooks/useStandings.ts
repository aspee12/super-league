'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMatches, getTeams, type PayloadMatch, type PayloadTeam } from '@/lib/matches-api'
import { computeMatchStatus } from '@/lib/match-status'
import { computeStandings, type StandingEntry } from '@/lib/compute-standings'
import { useSeasons } from './useSeasons'
import type { Match, Team } from '@app-types/matchTypes'

function toTeam(val: string | PayloadTeam): Team {
  if (typeof val === 'string') return { id: val, name: 'Unknown', logo: '' }
  return { id: val.id, name: val.name, logo: val.logo ?? '' }
}

function toMatch(doc: PayloadMatch): Match {
  return {
    id: doc.id,
    teamA: toTeam(doc.teamA),
    teamB: toTeam(doc.teamB),
    scoreA: doc.scoreA,
    scoreB: doc.scoreB,
    date: doc.date,
    time: doc.time,
    status: computeMatchStatus(doc.status, doc.date, doc.time),
    playerStats: doc.playerStats,
  }
}

export function useStandings() {
  const { viewingSeasonId, isReady } = useSeasons()

  const matchesQuery = useQuery({
    queryKey: ['matches', viewingSeasonId ?? null],
    queryFn: () => getMatches(viewingSeasonId),
    enabled: isReady,
    // Standings page: poll every 15s when a live match exists, else 2min.
    refetchInterval: (query) => {
      const docs = query.state.data as PayloadMatch[] | undefined
      if (!docs) return 30_000
      const hasLive = docs.some(
        (d) => computeMatchStatus(d.status, d.date, d.time) === 'live',
      )
      return hasLive ? 15_000 : 120_000
    },
  })

  // Scoped to the season on show. The table seeds a row for every club it is
  // handed so that clubs yet to play still appear, which means an unscoped
  // list would drop a newly-founded club into every past season's table.
  const teamsQuery = useQuery({
    queryKey: ['teams', viewingSeasonId ?? null],
    queryFn: () => getTeams(viewingSeasonId),
    enabled: isReady,
    refetchInterval: 120_000,
  })

  const standings: StandingEntry[] = useMemo(() => {
    const matches = (matchesQuery.data ?? []).map(toMatch)
    const teams: Team[] = (teamsQuery.data ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      logo: t.logo ?? '',
    }))
    const table = computeStandings(matches, teams)

    // Find each team's next upcoming match (earliest by date/time)
    const upcoming = matches
      .filter((m) => m.status === 'upcoming')
      .sort((a, b) => {
        const da = new Date(`${a.date}T${a.time}`)
        const db = new Date(`${b.date}T${b.time}`)
        return da.getTime() - db.getTime()
      })

    const nextMap = new Map<string, { logo: string; name: string }>()
    for (const match of upcoming) {
      if (!nextMap.has(match.teamA.id)) {
        nextMap.set(match.teamA.id, { logo: match.teamB.logo, name: match.teamB.name })
      }
      if (!nextMap.has(match.teamB.id)) {
        nextMap.set(match.teamB.id, { logo: match.teamA.logo, name: match.teamA.name })
      }
    }

    return table.map((entry) => ({
      ...entry,
      nextOpponent: nextMap.get(entry.team.id),
    }))
  }, [matchesQuery.data, teamsQuery.data])

  return {
    standings,
    isLoading: matchesQuery.isLoading || teamsQuery.isLoading,
  }
}
