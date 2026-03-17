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
    teamLogo: string
    avatar: string
  }
  goals: number
  assists: number
  yellowCards: number
  redCards: number
}

const TOP_N = 10

export function useStats() {
  const { matches } = useMatches()
  const { teams, players } = useTeams()

  // Build a lookup: playerName+teamName -> player avatar URL
  const playerAvatarMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of players) {
      const teamId = typeof p.team === 'string' ? p.team : p.team?.id
      const team = teams.find((t) => t.id === teamId)
      if (team) {
        map.set(`${p.name}-${team.name}`, p.avatar || '')
      }
    }
    return map
  }, [players, teams])

  const stats = useMemo(() => {
    const playerMap = new Map<string, AggregatedPlayerStat>()

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
              teamLogo: teamObj.logo || '',
              avatar: playerAvatarMap.get(key) || '',
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
  }, [matches, teams, playerAvatarMap])

  const topScorers = useMemo(
    () => [...stats].sort((a, b) => b.goals - a.goals).slice(0, TOP_N),
    [stats],
  )

  const topAssists = useMemo(
    () => [...stats].sort((a, b) => b.assists - a.assists).slice(0, TOP_N),
    [stats],
  )

  const topYellowCards = useMemo(
    () => [...stats].filter((s) => s.yellowCards > 0).sort((a, b) => b.yellowCards - a.yellowCards).slice(0, TOP_N),
    [stats],
  )

  const topRedCards = useMemo(
    () => [...stats].filter((s) => s.redCards > 0).sort((a, b) => b.redCards - a.redCards).slice(0, TOP_N),
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
