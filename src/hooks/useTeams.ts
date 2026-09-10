'use client'

import { useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTeams } from '@/lib/matches-api'
import { getPlayers, type PayloadPlayer } from '@/lib/teams-api'
import { useSeasons } from './useSeasons'

/**
 * The clubs and squads of the season currently being viewed.
 *
 * Both sides are season-scoped: a club appears only in the seasons it is
 * entered in, and squads are stored one record per player per season, so
 * looking at an old season shows the squad as it was then rather than as it is
 * now.
 */
export function useTeams() {
  const { viewingSeasonId, isReady } = useSeasons()

  const teamsQuery = useQuery({
    queryKey: ['teams', viewingSeasonId ?? null],
    queryFn: () => getTeams(viewingSeasonId),
    enabled: isReady,
    refetchInterval: 120_000,
  })

  const playersQuery = useQuery({
    queryKey: ['players', viewingSeasonId ?? null],
    queryFn: () => getPlayers(undefined, viewingSeasonId),
    enabled: isReady,
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
