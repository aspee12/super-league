'use client'

import { useCallback, useMemo } from 'react'
import { useTeams } from './useTeams'

/**
 * Answers "is this player their team's keeper?" for surfaces that only carry a
 * player's *name* — match `playerStats` records the scorer as a bare string, so
 * the keeper flag has to be looked up against the squad list.
 *
 * Names are only unique within a club, hence the composite key. Backed by the
 * same `useTeams()` queries every other view uses, so this adds no extra fetch.
 */
export function useGoalkeepers() {
  const { players } = useTeams()

  const goalkeeperKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const p of players) {
      if (!p.isGoalkeeper) continue
      const teamId = typeof p.team === 'string' ? p.team : p.team?.id
      if (!teamId) continue
      keys.add(`${p.name}-${teamId}`)
    }
    return keys
  }, [players])

  const isGoalkeeper = useCallback(
    (playerName: string | undefined, teamId: string | undefined) =>
      !!playerName && !!teamId && goalkeeperKeys.has(`${playerName}-${teamId}`),
    [goalkeeperKeys],
  )

  return { isGoalkeeper }
}
