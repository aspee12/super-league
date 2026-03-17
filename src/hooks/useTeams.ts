'use client'

import { useQuery } from '@tanstack/react-query'
import { getTeams } from '@/lib/matches-api'
import { getPlayers, type PayloadPlayer } from '@/lib/teams-api'

export function useTeams() {
  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    refetchInterval: 60_000,
  })

  const playersQuery = useQuery({
    queryKey: ['players'],
    queryFn: () => getPlayers(),
    refetchInterval: 60_000,
  })

  const teams = teamsQuery.data ?? []
  const players = playersQuery.data ?? []

  /** Get players belonging to a specific team. */
  function getPlayersByTeam(teamId: string): PayloadPlayer[] {
    return players.filter((p) => {
      const pTeamId = typeof p.team === 'string' ? p.team : p.team?.id
      return pTeamId === teamId
    })
  }

  /** Get player names for a team (by team name). Used by score update modals. */
  function getPlayerNamesByTeamName(teamName: string): string[] {
    const team = teams.find((t) => t.name === teamName)
    if (!team) return []
    return getPlayersByTeam(team.id).map((p) => p.name)
  }

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
