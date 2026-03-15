'use client'

import { useQuery } from '@tanstack/react-query'
import { getMatches, type PayloadMatch, type PayloadTeam } from '@/lib/matches-api'
import { computeMatchStatus } from '@/lib/match-status'
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
  const query = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches,
    refetchInterval: 30_000,
  })

  const matches = (query.data ?? []).map(toMatch)

  const liveMatches = matches.filter((m) => m.status === 'live')
  const upcomingMatches = matches
    .filter((m) => m.status === 'upcoming')
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 2)
  const recentMatches = matches
    .filter((m) => m.status === 'finished')
    .slice(0, 3)

  return {
    ...query,
    matches,
    liveMatches,
    upcomingMatches,
    recentMatches,
  }
}
