'use client'

import type { PlayerStat } from '@app-types/matchTypes'
import { GoalkeeperBadge } from '@shared-component/GoalkeeperBadge'
import { useGoalkeepers } from '@/hooks/useGoalkeepers'

function CardIcon({ card }: { card?: 'none' | 'yellow' | 'red' }) {
  if (card === 'yellow') return <span className="inline-block w-2 h-3 bg-yellow-400 rounded-sm" />
  if (card === 'red') return <span className="inline-block w-2 h-3 bg-red-600 rounded-sm" />
  return null
}

interface ExpandedMatchStatsProps {
  readonly stats: PlayerStat[]
  /** Needed to resolve keepers — `stats` carries player names only. */
  readonly teamAId?: string
  readonly teamBId?: string
}

/**
 * PL-style goals/assists/cards panel under a mobile match card.
 *
 * Shared by the Matches and All Results screens, which previously kept
 * byte-identical copies of this markup.
 */
export function ExpandedMatchStats({ stats, teamAId, teamBId }: ExpandedMatchStatsProps) {
  const { isGoalkeeper } = useGoalkeepers()

  const teamAStats = stats.filter((s) => s.team === 'teamA')
  const teamBStats = stats.filter((s) => s.team === 'teamB')

  return (
    <div className="flex justify-between text-xs text-gray-600 mt-2 px-1">
      <div className="space-y-1.5">
        {teamAStats.map((s, i) => {
          const hasGoals = s.goals > 0
          const hasCard = s.card === 'yellow' || s.card === 'red'
          return (
            <div key={i}>
              {hasGoals && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">{s.playerName}</span>
                  <span>{s.goals}&apos;</span>
                  {isGoalkeeper(s.playerName, teamAId) && <GoalkeeperBadge size="sm" />}
                  {hasCard && <CardIcon card={s.card} />}
                </div>
              )}
              {!hasGoals && hasCard && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">{s.playerName}</span>
                  {isGoalkeeper(s.playerName, teamAId) && <GoalkeeperBadge size="sm" />}
                  <CardIcon card={s.card} />
                </div>
              )}
              {s.assistName && (
                <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                  <span>{s.assistName} (Assist)</span>
                  {isGoalkeeper(s.assistName, teamAId) && <GoalkeeperBadge size="sm" />}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="space-y-1.5 text-right">
        {teamBStats.map((s, i) => {
          const hasGoals = s.goals > 0
          const hasCard = s.card === 'yellow' || s.card === 'red'
          return (
            <div key={i}>
              {hasGoals && (
                <div className="flex items-center justify-end gap-1">
                  {hasCard && <CardIcon card={s.card} />}
                  {isGoalkeeper(s.playerName, teamBId) && <GoalkeeperBadge size="sm" />}
                  <span>{s.goals}&apos;</span>
                  <span className="font-medium">{s.playerName}</span>
                </div>
              )}
              {!hasGoals && hasCard && (
                <div className="flex items-center justify-end gap-1">
                  <CardIcon card={s.card} />
                  {isGoalkeeper(s.playerName, teamBId) && <GoalkeeperBadge size="sm" />}
                  <span className="font-medium">{s.playerName}</span>
                </div>
              )}
              {s.assistName && (
                <div className="flex items-center justify-end gap-1 text-gray-400 text-[10px]">
                  {isGoalkeeper(s.assistName, teamBId) && <GoalkeeperBadge size="sm" />}
                  <span>{s.assistName} (Assist)</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
