'use client'

import { useMemo } from 'react'
import { useMatches } from './useMatches'
import { useTeams } from './useTeams'

export interface AggregatedPlayerStat {
  id: string
  player: {
    id: string
    name: string
    team: string
    avatar: string
  }
  goals: number
  assists: number
  yellowCards: number
  redCards: number
}

export function useStats() {
  const { matches } = useMatches()
  const { teams } = useTeams()

  const stats = useMemo(() => {
    const playerMap = new Map<string, AggregatedPlayerStat>()

    // Only count finished and live matches
    const relevantMatches = matches.filter((m) => m.status === 'finished' || m.status === 'live')

    for (const match of relevantMatches) {
      if (!match.playerStats) continue

      for (const ps of match.playerStats) {
        const teamObj = ps.team === 'teamA' ? match.teamA : match.teamB
        const teamName = teamObj.name
        const key = `${ps.playerName}-${teamName}`

        const existing = playerMap.get(key)
        if (existing) {
          existing.goals += ps.goals
          existing.assists += ps.assists
          if (ps.card === 'yellow') existing.yellowCards += 1
          if (ps.card === 'red') existing.redCards += 1
        } else {
          playerMap.set(key, {
            id: key,
            player: {
              id: key,
              name: ps.playerName,
              team: teamName,
              avatar: teamObj.logo || '',
            },
            goals: ps.goals,
            assists: ps.assists,
            yellowCards: ps.card === 'yellow' ? 1 : 0,
            redCards: ps.card === 'red' ? 1 : 0,
          })
        }
      }
    }

    return Array.from(playerMap.values())
  }, [matches, teams])

  const topScorers = useMemo(
    () => [...stats].sort((a, b) => b.goals - a.goals),
    [stats],
  )

  const topAssists = useMemo(
    () => [...stats].sort((a, b) => b.assists - a.assists),
    [stats],
  )

  const topYellowCards = useMemo(
    () => [...stats].filter((s) => s.yellowCards > 0).sort((a, b) => b.yellowCards - a.yellowCards),
    [stats],
  )

  const topRedCards = useMemo(
    () => [...stats].filter((s) => s.redCards > 0).sort((a, b) => b.redCards - a.redCards),
    [stats],
  )

  return {
    stats,
    topScorers,
    topAssists,
    topYellowCards,
    topRedCards,
  }
}
