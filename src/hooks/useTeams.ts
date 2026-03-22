'use client'

import { useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTeams } from '@/lib/matches-api'
import { getPlayers, type PayloadPlayer } from '@/lib/teams-api'

export function useTeams() {
  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    refetchInterval: 120_000,
  })

  const playersQuery = useQuery({
    queryKey: ['players'],
    queryFn: () => getPlayers(),
    refetchInterval: 120_000,
  })

  const teams = useMemo(() => teamsQuery.data ?? [], [teamsQuery.data])
  const players = useMemo(() => playersQuery.data ?? [], [playersQuery.data])

  // Pre-build a Map<teamId, PayloadPlayer[]> so lookups are O(1) instead of O(n)
  const playersByTeamMap = useMemo(() => {
    const map = new Map<string, PayloadPlayer[]>()
    for (const p of players) {
      const teamId = typeof p.team === 'string' ? p.team : p.team?.id
      if (!teamId) continue
      const arr = map.get(teamId)
      if (arr) arr.push(p)
      else map.set(teamId, [p])
    }
    return map
  }, [players])

  const getPlayersByTeam = useCallback(
    (teamId: string): PayloadPlayer[] => playersByTeamMap.get(teamId) ?? [],
    [playersByTeamMap],
  )

  const getPlayerNamesByTeamName = useCallback(
    (teamName: string): string[] => {
      const team = teams.find((t) => t.name === teamName)
      if (!team) return []
      return (playersByTeamMap.get(team.id) ?? []).map((p) => p.name)
    },
    [teams, playersByTeamMap],
  )

  return {
    teams,
    players,
    getPlayersByTeam,
    getPlayerNamesByTeamName,
    isLoading: teamsQuery.isLoading || playersQuery.isLoading,
    teamsQuery,
    playersQuery,
  }
}
