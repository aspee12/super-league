'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MoreVertical,
  RefreshCcw,
  Pencil,
  Pause,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MobileUpdateScoreModal } from '@shared-component/modals/MobileModals/MobileUpdateScoreModal'
import { ConfirmModal } from '@shared-component/modals/ConfirmationModal/ConfirmModal'
import { MobileAddMatchModal } from '@shared-component/modals/MobileModals/MobileAddMatchModal'
import { useAuthStore } from '@/store/authStore'
import { useMatches } from '@/hooks/useMatches'
import { useSeasons } from '@/hooks/useSeasons'
import { endMatch, deleteMatch } from '@/lib/matches-api'
import type { Match, PlayerStat } from '@app-types/matchTypes'
import { formatTime12h } from '@/lib/format-time'
import { TeamLogo } from '@shared-component/TeamLogo'
import { FullPageLoader } from '@shared-component/FullPageLoader'
import { ArchiveSeasonNotice, SeasonFilter } from '@shared-component/SeasonFilter'

export function MobileMatchesView() {
  const queryClient = useQueryClient()
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showUpcomingMenu, setShowUpcomingMenu] = useState<string | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [expandedStats, setExpandedStats] = useState<Record<string, boolean>>({})
  const user = useAuthStore((response) => response.user)
  const { isViewingActiveSeason } = useSeasons()
  // Archived seasons are read-only — see the note in MatchesView.
  const isSuperAdmin = user?.role === 'super_admin' && isViewingActiveSeason

  const { liveMatches, upcomingMatches, recentMatches, isLoading } = useMatches()

  const [confirmState, setConfirmState] = useState<{
    type: 'end' | 'delete' | null
    match: Match | null
  }>({ type: null, match: null })

  const endMatchMutation = useMutation({
    mutationFn: (id: string) => endMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      toast.success('Match ended.')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMatchMutation = useMutation({
    mutationFn: (id: string) => deleteMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      toast.success('Match deleted.')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleConfirm = () => {
    if (!confirmState.match) return
    if (confirmState.type === 'end') {
      endMatchMutation.mutate(confirmState.match.id)
    }
    if (confirmState.type === 'delete') {
      deleteMatchMutation.mutate(confirmState.match.id)
    }
    setConfirmState({ type: null, match: null })
  }

  const toggleStats = (matchId: string) => {
    setExpandedStats((prev) => ({ ...prev, [matchId]: !prev[matchId] }))
  }

  if (isLoading) {
    return <FullPageLoader message="Loading matches..." />
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="px-4 mt-4 mb-3">
        <SeasonFilter showReset={false} />
        <div className="mt-3">
          <ArchiveSeasonNotice />
        </div>
      </div>

      {/* Live Now Section */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <h2 className="font-semibold text-gray-800">Live Now</h2>
            </div>
            {liveMatches.length > 0 && (
              <div className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
            )}
          </div>

          {liveMatches.length > 0 ? (
            <div className="space-y-3">
              {liveMatches.map((match) => {

                const isExpanded = expandedStats[match.id]

                return (
                  <div
                    key={match.id}
                    className="bg-white rounded-2xl shadow-lg border border-red-500 overflow-hidden"
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-4 gap-2">
                        {/* Team A */}
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          <div className="mb-1.5"><TeamLogo logo={match.teamA.logo || '⚽'} name={match.teamA.name} className="w-10 h-10" textClassName="text-3xl" /></div>
                          <span className="text-xs font-medium text-center px-1 line-clamp-2">
                            {match.teamA.name}
                          </span>
                        </div>

                        {/* Score */}
                        <div className="flex flex-col items-center px-2 shrink-0">
                          <div className="text-2xl font-bold text-gray-800 mb-1 whitespace-nowrap">
                            {match.scoreA}-{match.scoreB}
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">{match.date}</div>
                          <div className="text-xs font-semibold text-gray-700 whitespace-nowrap">{formatTime12h(match.time)}</div>
                        </div>

                        {/* Team B */}
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          <div className="mb-1.5"><TeamLogo logo={match.teamB.logo || '⚽'} name={match.teamB.name} className="w-10 h-10" textClassName="text-3xl" /></div>
                          <span className="text-xs font-medium text-center px-1 line-clamp-2">
                            {match.teamB.name}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      {(match.playerStats ?? []).length > 0 && (
                        <div className="border-t border-gray-100 pt-2 mb-3">
                          <ExpandedMatchStats
                            stats={isExpanded ? (match.playerStats ?? []) : (match.playerStats ?? []).slice(0, 2)}
                          />
                          {(match.playerStats ?? []).length > 2 && (
                            <button
                              onClick={() => toggleStats(match.id)}
                              className="text-[#0e7490] mt-1"
                              aria-label={isExpanded ? 'Show less' : 'Show all'}
                            >
                              {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Admin Actions */}
                      {isSuperAdmin && (
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => { setSelectedMatch(match); setShowUpdateModal(true) }}
                            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-2 py-2.5 border-2 rounded-md hover:bg-[#0e7490]/5 active:bg-[#0e7490]/10 transition-colors text-xs font-medium"
                          >
                            <RefreshCcw size={14} className="text-[#0e7490]" />
                            <span>Update</span>
                          </button>
                          <button
                            onClick={() => { setSelectedMatch(match); setShowEditModal(true) }}
                            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-2 py-2.5 border-2 rounded-md hover:bg-[#0e7490]/5 active:bg-[#0e7490]/10 transition-colors text-xs font-medium"
                          >
                            <Pencil size={14} className="text-[#0e7490]" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setConfirmState({ type: 'end', match })}
                            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 border px-2 py-2.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 active:bg-gray-300 transition-colors text-xs font-medium"
                          >
                            <Pause size={14} className="text-[#0e7490]" />
                            <span>End</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-sm py-4">No live matches</p>
          )}
        </div>
      </div>

      {/* Upcoming Section */}
      <div className="px-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Upcoming</h2>
        {upcomingMatches.length > 0 ? (
          <div className="space-y-3">
            {upcomingMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-xl shadow-sm p-4 relative">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className="mb-1.5"><TeamLogo logo={match.teamA.logo || '⚽'} name={match.teamA.name} className="w-10 h-10" textClassName="text-3xl" /></div>
                    <span className="text-xs font-medium text-gray-800 text-center px-1 line-clamp-2">{match.teamA.name}</span>
                  </div>
                  <div className="flex flex-col items-center shrink-0 px-1">
                    <div className="text-xs text-gray-500 mb-1 whitespace-nowrap">{match.date}</div>
                    <div className="text-xs text-gray-400 mb-1">VS</div>
                    <div className="text-sm font-medium text-gray-800 whitespace-nowrap">{formatTime12h(match.time)}</div>
                  </div>
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div className="mb-1.5"><TeamLogo logo={match.teamB.logo || '⚽'} name={match.teamB.name} className="w-10 h-10" textClassName="text-3xl" /></div>
                    <span className="text-xs font-medium text-gray-800 text-center px-1 line-clamp-2">{match.teamB.name}</span>
                  </div>
                  {isSuperAdmin && (
                    <div className="relative self-start">
                      <button
                        onClick={() => setShowUpcomingMenu(showUpcomingMenu === match.id ? null : match.id)}
                        className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-full p-2 transition-colors"
                      >
                        <MoreVertical size={16} className="text-gray-600" />
                      </button>
                      {showUpcomingMenu === match.id && (
                        <>
                          <div className="fixed inset-0 z-0" onClick={() => setShowUpcomingMenu(null)} />
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 w-28">
                            <button
                              onClick={() => { setSelectedMatch(match); setShowEditModal(true); setShowUpcomingMenu(null) }}
                              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => { setConfirmState({ type: 'delete', match }); setShowUpcomingMenu(null) }}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-gray-100 active:bg-gray-200"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm py-4">No upcoming matches</p>
        )}
      </div>

      {/* Recent Result Section */}
      <div className="px-4 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Recent Results</h2>
        {recentMatches.length > 0 ? (
          <div className="space-y-3">
            {recentMatches.map((match) => {
              const isExpanded = expandedStats[match.id]

              return (
                <div key={match.id} className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className="mb-1.5"><TeamLogo logo={match.teamA.logo || '⚽'} name={match.teamA.name} className="w-8 h-8" textClassName="text-2xl" /></div>
                      <span className="text-xs font-medium text-gray-800 text-center px-1 line-clamp-2">{match.teamA.name}</span>
                    </div>
                    <div className="flex flex-col items-center shrink-0 px-1">
                      <div className="bg-[#0e7490] text-white px-3 py-1.5 rounded-md">
                        <div className="text-sm font-bold whitespace-nowrap">{match.scoreA}-{match.scoreB}</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">{match.date}</div>
                    </div>
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className="mb-1.5"><TeamLogo logo={match.teamB.logo || '⚽'} name={match.teamB.name} className="w-8 h-8" textClassName="text-2xl" /></div>
                      <span className="text-xs font-medium text-gray-800 text-center px-1 line-clamp-2">{match.teamB.name}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  {(match.playerStats ?? []).length > 0 && (
                    <div className="border-t border-gray-100 mt-3 pt-2">
                      <ExpandedMatchStats
                        stats={isExpanded ? (match.playerStats ?? []) : (match.playerStats ?? []).slice(0, 2)}
                      />
                      {(match.playerStats ?? []).length > 2 && (
                        <button
                          onClick={() => toggleStats(match.id)}
                          className="text-[#0e7490] mt-1"
                          aria-label={isExpanded ? 'Show less' : 'Show all'}
                        >
                          {isExpanded ? <Minus size={16} /> : <Plus size={16} />}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm py-4">No recent results</p>
        )}

        <Link
          href="/results"
          className="w-full mt-4 bg-white rounded-xl shadow-sm p-4 flex items-center justify-center gap-2 text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-medium">View all results</span>
          <ChevronRight size={16} className="text-gray-600" />
        </Link>
      </div>

      {/* Modals */}
      <MobileUpdateScoreModal
        isOpen={showUpdateModal}
        match={selectedMatch}
        onClose={() => { setShowUpdateModal(false); setSelectedMatch(null) }}
      />

      <MobileAddMatchModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedMatch(null) }}
        onSubmit={() => { setShowEditModal(false); setSelectedMatch(null) }}
        initialData={
          selectedMatch
            ? {
                id: selectedMatch.id,
                teamA: selectedMatch.teamA.id,
                teamB: selectedMatch.teamB.id,
                date: selectedMatch.date,
                time: selectedMatch.time,
                status: selectedMatch.status,
              }
            : null
        }
        title={
          selectedMatch?.status === 'upcoming'
            ? 'Edit Upcoming Match'
            : selectedMatch ? 'Edit Match' : 'Add New Match'
        }
        submitText={
          selectedMatch?.status === 'upcoming'
            ? 'Change'
            : selectedMatch ? 'Update Match' : 'Add Match'
        }
      />

      <ConfirmModal
        isOpen={!!confirmState.type}
        onClose={() => setConfirmState({ type: null, match: null })}
        onConfirm={handleConfirm}
        title={confirmState.type === 'end' ? 'End Match?' : 'Delete Match?'}
        message={
          confirmState.type === 'end'
            ? 'Are you sure you want to end this match?'
            : 'Are you sure you want to delete this match?'
        }
        confirmText={confirmState.type === 'end' ? 'End' : 'Delete'}
        confirmVariant={confirmState.type === 'delete' ? 'danger' : 'primary'}
      />
    </div>
  )
}

function CardIcon({ card }: { card?: 'none' | 'yellow' | 'red' }) {
  if (card === 'yellow') return <span className="inline-block w-2 h-3 bg-yellow-400 rounded-sm" />
  if (card === 'red') return <span className="inline-block w-2 h-3 bg-red-600 rounded-sm" />
  return null
}

/** Expanded stats panel — PL-style with goals, assists & cards */
function ExpandedMatchStats({ stats }: { stats: PlayerStat[] }) {
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
                  {hasCard && <CardIcon card={s.card} />}
                </div>
              )}
              {!hasGoals && hasCard && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">{s.playerName}</span>
                  <CardIcon card={s.card} />
                </div>
              )}
              {s.assistName && (
                <div className="text-gray-400 text-[10px]">{s.assistName} (Assist)</div>
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
                  <span>{s.goals}&apos;</span>
                  <span className="font-medium">{s.playerName}</span>
                </div>
              )}
              {!hasGoals && hasCard && (
                <div className="flex items-center justify-end gap-1">
                  <CardIcon card={s.card} />
                  <span className="font-medium">{s.playerName}</span>
                </div>
              )}
              {s.assistName && (
                <div className="text-gray-400 text-[10px]">{s.assistName} (Assist)</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
