'use client'

import type { Match, PlayerStat } from '@app-types/matchTypes'
import { Pencil, Trash2 } from 'lucide-react'
import { formatTime12h } from '@/lib/format-time'
import { TeamLogo } from '@shared-component/TeamLogo'
import { GoalkeeperBadge } from '@shared-component/GoalkeeperBadge'
import { useGoalkeepers } from '@/hooks/useGoalkeepers'

interface MatchCardProps {
  match: Match
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
  variant?: 'live' | 'upcoming' | 'result'
}

function CardIcon({ card }: { card?: 'none' | 'yellow' | 'red' }) {
  if (card === 'yellow') return <span className="inline-block w-2.5 h-3.5 bg-yellow-400 rounded-sm" />
  if (card === 'red') return <span className="inline-block w-2.5 h-3.5 bg-red-600 rounded-sm" />
  return null
}

function StatLine({
  stat,
  side,
  scorerIsGk,
  assisterIsGk,
}: {
  stat: PlayerStat
  side: 'left' | 'right'
  scorerIsGk: boolean
  assisterIsGk: boolean
}) {
  const hasGoals = stat.goals > 0
  const hasCard = stat.card === 'yellow' || stat.card === 'red'

  const assistLine = stat.assistName && (
    <div className="flex items-center gap-1 text-gray-400">
      {side === 'right' && assisterIsGk && <GoalkeeperBadge size="sm" />}
      <span>{stat.assistName} (Assist)</span>
      {side === 'left' && assisterIsGk && <GoalkeeperBadge size="sm" />}
    </div>
  )

  if (side === 'left') {
    return (
      <div className="flex flex-col gap-0.5">
        {hasGoals && (
          <div className="flex items-center gap-1">
            <span>{stat.playerName} {stat.goals}&apos;</span>
            {scorerIsGk && <GoalkeeperBadge size="sm" />}
            {hasCard && <CardIcon card={stat.card} />}
          </div>
        )}
        {!hasGoals && hasCard && (
          <div className="flex items-center gap-1">
            <span>{stat.playerName}</span>
            {scorerIsGk && <GoalkeeperBadge size="sm" />}
            <CardIcon card={stat.card} />
          </div>
        )}
        {assistLine}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 items-end">
      {hasGoals && (
        <div className="flex items-center justify-end gap-1">
          {hasCard && <CardIcon card={stat.card} />}
          {scorerIsGk && <GoalkeeperBadge size="sm" />}
          <span>{stat.goals}&apos; {stat.playerName}</span>
        </div>
      )}
      {!hasGoals && hasCard && (
        <div className="flex items-center justify-end gap-1">
          <CardIcon card={stat.card} />
          {scorerIsGk && <GoalkeeperBadge size="sm" />}
          <span>{stat.playerName}</span>
        </div>
      )}
      {assistLine}
    </div>
  )
}

export function MatchCard({ match, showActions = false, onEdit, onDelete, variant }: MatchCardProps) {
  const isLive = match.status === 'live'
  const isUpcoming = match.status === 'upcoming'

  const teamAStats = (match.playerStats ?? []).filter((s) => s.team === 'teamA')
  const teamBStats = (match.playerStats ?? []).filter((s) => s.team === 'teamB')

  // `playerStats` stores names only, so keepers are resolved against the squad.
  const { isGoalkeeper } = useGoalkeepers()

  return (
    <div className="bg-white rounded-lg shadow-sm relative">
      {isLive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-l-lg" />
      )}

      {/* Actions */}
      {showActions && (
        <div className="bg-[#F8F9FA] flex justify-end items-center gap-2 px-6 py-3 rounded-t-lg">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0e7490] bg-[#e0f2f7] hover:bg-[#cce9f0] rounded-md transition-colors"
            >
              <Pencil size={14} />
              <span>Edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}

      <div className="p-6 pt-4 relative px-[42px]">
        {/* Player stats for live/finished matches */}
        {!isUpcoming && (teamAStats.length > 0 || teamBStats.length > 0) && (
          <div className="flex justify-between text-xs text-gray-600 mb-4">
            <div className="space-y-1">
              {teamAStats.map((stat, i) => (
                <StatLine
                  key={i}
                  stat={stat}
                  side="left"
                  scorerIsGk={isGoalkeeper(stat.playerName, match.teamA.id)}
                  assisterIsGk={isGoalkeeper(stat.assistName, match.teamA.id)}
                />
              ))}
            </div>
            <div className="space-y-1">
              {teamBStats.map((stat, i) => (
                <StatLine
                  key={i}
                  stat={stat}
                  side="right"
                  scorerIsGk={isGoalkeeper(stat.playerName, match.teamB.id)}
                  assisterIsGk={isGoalkeeper(stat.assistName, match.teamB.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex items-center justify-between">
          {/* Team A */}
          <div className="flex flex-col items-center w-1/4">
            <div className="mb-3"><TeamLogo logo={match.teamA.logo || '⚽'} name={match.teamA.name} className="w-12 h-12" textClassName="text-4xl" /></div>
            <div className="text-sm font-medium text-center text-black">{match.teamA.name}</div>
          </div>

          {/* Score/Time */}
          <div className="flex flex-col items-center flex-1">
            {isUpcoming ? (
              <>
                <div className="text-2xl font-bold mb-1">{formatTime12h(match.time)}</div>
                <div className="text-gray-600 text-sm mb-2">VS</div>
                <div className="text-gray-600 text-sm">{match.date}</div>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-600 mb-2">{match.date}</div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-5xl font-bold text-black">{match.scoreA}</div>
                  <div className="text-gray-400">-</div>
                  <div className="text-5xl font-bold text-black">{match.scoreB}</div>
                </div>
                <div className="text-xs mb-1 text-black">{formatTime12h(match.time)}</div>
                {isLive && (
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    ● LIVE
                  </div>
                )}
              </>
            )}
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center w-1/4">
            <div className="mb-3"><TeamLogo logo={match.teamB.logo || '⚽'} name={match.teamB.name} className="w-12 h-12" textClassName="text-4xl" /></div>
            <div className="text-sm font-medium text-center text-black">{match.teamB.name}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
