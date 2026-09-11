'use client'

import { ChevronRight, Pause, Pencil, Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MatchCard } from '@shared-component/MatchCard'
import dynamic from 'next/dynamic'
import { ConfirmModal } from '@shared-component/modals/ConfirmationModal/ConfirmModal'
import { useAuthStore } from '@/store/authStore'
import { useMatches } from '@/hooks/useMatches'
import { useSeasons } from '@/hooks/useSeasons'
import { endMatch, deleteMatch } from '@/lib/matches-api'
import Link from 'next/link'
import type { Match } from '@app-types/matchTypes'
import { FullPageLoader } from '@shared-component/FullPageLoader'
import { ArchiveSeasonNotice, SeasonFilter } from '@shared-component/SeasonFilter'
import { FixturePager, fixtureDateRange } from '@shared-component/FixturePager'
import { paginate } from '@shared-component/ListPagination'

/** A matchweek is two fixtures, so the pager steps a matchweek at a time. */
const MATCHES_PER_MATCHWEEK = 2

// Both pull in react-day-picker + date-fns through DatePicker — load on demand.
const AddMatchModal = dynamic(
  () => import('@shared-component/modals/WebModals/AddMatchModal'),
  { ssr: false },
)
const UpdateScoreModal = dynamic(
  () => import('@shared-component/modals/WebModals/UpdateScoreModal').then((m) => m.UpdateScoreModal),
  { ssr: false },
)

export function MatchesView() {
  const queryClient = useQueryClient()
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [showUpdateScoreModal, setShowUpdateScoreModal] = useState(false)
  const user = useAuthStore((response) => response.user)
  const { isViewingActiveSeason } = useSeasons()
  // A completed season is an archive: no adding fixtures, editing scores or
  // deleting results once the campaign it belongs to is over.
  const isSuperAdmin = user?.role === 'super_admin' && isViewingActiveSeason

  const [confirmState, setConfirmState] = useState<{
    type: 'end' | 'delete' | null
    match: Match | null
  }>({ type: null, match: null })

  const { liveMatches, upcomingMatches, recentMatches, allResults, isLoading } = useMatches()

  const [upcomingPage, setUpcomingPage] = useState(1)
  const upcoming = paginate(upcomingMatches, upcomingPage, MATCHES_PER_MATCHWEEK)

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

  if (isLoading) {
    return <FullPageLoader message="Loading matches..." />
  }

  return (
    <div className="min-h-full flex-1 p-6">
      <div className="hidden md:flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Matches</h1>
        <SeasonFilter />
      </div>
      <ArchiveSeasonNotice />

      {/* Live Now Section */}
      <div className="hidden md:block mb-4">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-black">Live Now</h2>
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => {
                  setSelectedMatch(null)
                  setIsMatchModalOpen(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0e7490] text-white rounded-md hover:bg-[#0c6380] transition-colors text-sm"
              >
                <Plus size={16} />
                <span>Add Match</span>
              </button>
            )}
          </div>
        </div>

        {liveMatches.length > 0 ? (
          <div className="space-y-4 mt-4">
            {liveMatches.map((match) => (
              <div
                key={match.id}
                className="relative bg-[#F8F9FA] rounded-lg shadow-sm"
              >
                {isSuperAdmin && (
                  <div className="flex justify-end items-center gap-2 px-6 py-3 rounded-tr-lg">
                    <button
                      onClick={() => {
                        setSelectedMatch(match)
                        setShowUpdateScoreModal(true)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0e7490] bg-[#e0f2f7] hover:bg-[#cce9f0] rounded-md transition-colors"
                    >
                      <RefreshCw size={14} />
                      <span>Update Score</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMatch(match)
                        setIsMatchModalOpen(true)
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0e7490] bg-[#e0f2f7] hover:bg-[#cce9f0] rounded-md transition-colors"
                    >
                      <Pencil size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setConfirmState({ type: 'end', match })}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0e7490] bg-[#e0f2f7] hover:bg-[#cce9f0] rounded-md transition-colors"
                    >
                      <Pause size={14} />
                      <span>End Match</span>
                    </button>
                  </div>
                )}
                <MatchCard match={match} showActions={false} variant="live" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No live matches</div>
        )}
      </div>

      {/* Upcoming Section */}
      <div className="mb-8">
        <div className="bg-[#c5dce6] rounded-t-lg px-6 py-3">
          <h2 className="font-semibold text-[#0c5273]">Upcoming</h2>
        </div>
        {upcomingMatches.length > 0 ? (
          <>
            <FixturePager
              page={upcoming.safePage}
              pageCount={upcoming.pageCount}
              onPageChange={setUpcomingPage}
              label={`Matchweek ${upcoming.safePage}`}
              subLabel={fixtureDateRange(upcoming.visible)}
              className="mt-4"
            />
            <div className="space-y-4 mt-4">
              {upcoming.visible.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  variant="upcoming"
                  showActions={isSuperAdmin}
                  onEdit={() => {
                    setSelectedMatch(match)
                    setIsMatchModalOpen(true)
                  }}
                  onDelete={() => setConfirmState({ type: 'delete', match })}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">No upcoming matches</div>
        )}
      </div>

      {/* Recent Results Section */}
      <div>
        <div className="bg-[#c5e6d4] rounded-t-lg px-6 py-3">
          <h2 className="font-semibold text-[#0c5273]">Recent Results</h2>
        </div>
        {recentMatches.length > 0 ? (
          <div className="space-y-4 mt-4">
            {recentMatches.map((match) => (
              <MatchCard key={match.id} match={match} variant="result" />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No recent results</div>
        )}
        {/* Only worth a link when there are results the list above doesn't
            already show — with 3 or fewer, "Recent Results" is all of them. */}
        {allResults.length > recentMatches.length && (
          <Link
            href="/results"
            className="w-full mt-4 bg-white rounded-lg shadow-sm p-4 flex items-center justify-center gap-2 text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium">View all results</span>
            <ChevronRight size={16} className="text-gray-600" />
          </Link>
        )}
      </div>

      {/* Modals */}
      <AddMatchModal
        isOpen={isMatchModalOpen}
        onClose={() => {
          setIsMatchModalOpen(false)
          setSelectedMatch(null)
        }}
        onSubmit={() => {
          setIsMatchModalOpen(false)
          setSelectedMatch(null)
        }}
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
            : selectedMatch
              ? 'Edit Match'
              : 'Add New Match'
        }
        submitText={
          selectedMatch?.status === 'upcoming'
            ? 'Change'
            : selectedMatch
              ? 'Update Match'
              : 'Add Match'
        }
      />

      <UpdateScoreModal
        isOpen={showUpdateScoreModal}
        match={selectedMatch}
        onClose={() => {
          setShowUpdateScoreModal(false)
          setSelectedMatch(null)
        }}
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
