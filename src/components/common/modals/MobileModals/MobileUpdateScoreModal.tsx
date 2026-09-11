'use client'

import { ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useResetOnOpen } from '@/hooks/useResetOnOpen'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateScore } from '@/lib/matches-api'
import { TeamLogo } from '@shared-component/TeamLogo'
import { getPlayers, type PayloadPlayer } from '@/lib/teams-api'
import { useSeasons } from '@/hooks/useSeasons'
import type { Match } from '@app-types/matchTypes'

export interface MobileUpdateScoreModalProps {
  isOpen: boolean
  onClose: () => void
  match: Match | null
}

export function MobileUpdateScoreModal({
  isOpen,
  onClose,
  match,
}: MobileUpdateScoreModalProps) {
  const queryClient = useQueryClient()
  const { viewingSeasonId } = useSeasons()

  // This season's squads only — otherwise the scorer list carries every player
  // who has ever been registered, including duplicates of the same name from
  // earlier seasons.
  const { data: allPlayers = [] } = useQuery({
    queryKey: ['players', viewingSeasonId ?? null],
    queryFn: () => getPlayers(undefined, viewingSeasonId),
    enabled: isOpen,
  })

  const [formData, setFormData] = useState({
    team: '' as '' | 'teamA' | 'teamB',
    player: '',
    goals: '',
    assist: '',
    card: '' as '' | 'none' | 'yellow' | 'red',
  })

  const mutation = useMutation({
    mutationFn: () => {
      if (!match) throw new Error('No match selected')
      return updateScore(
        match.id,
        {
          scoreA: match.scoreA,
          scoreB: match.scoreB,
          playerStats: match.playerStats,
        },
        {
          team: formData.team as 'teamA' | 'teamB',
          playerName: formData.player,
          goals: parseInt(formData.goals) || 0,
          assists: formData.assist ? 1 : 0,
          assistName: formData.assist || undefined,
          card: (formData.card || 'none') as 'none' | 'yellow' | 'red',
        },
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      toast.success('Score updated.')
      handleClose()
    },
    onError: (err: Error) => toast.error(err.message),
  })

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useResetOnOpen(isOpen, () => {
    setFormData({ team: '', player: '', goals: '', assist: '', card: '' })
  })

  if (!isOpen || !match) return null

  const teamAName = match.teamA.name
  const teamBName = match.teamB.name

  const selectedTeamId =
    formData.team === 'teamA'
      ? match.teamA.id
      : formData.team === 'teamB'
        ? match.teamB.id
        : ''
  const playersForTeam = selectedTeamId
    ? allPlayers
        .filter((p: PayloadPlayer) => {
          const pTeamId = typeof p.team === 'string' ? p.team : p.team?.id
          return pTeamId === selectedTeamId
        })
        .map((p: PayloadPlayer) => p.name)
    : []

  const handleClose = () => {
    setFormData({ team: '', player: '', goals: '', assist: '', card: '' })
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.team) {
      toast.error('Select a team.')
      return
    }
    if (!formData.player) {
      toast.error('Select a player.')
      return
    }
    const hasCard = formData.card === 'yellow' || formData.card === 'red'
    if (!formData.goals && !hasCard) {
      toast.error('Enter goals or select a card.')
      return
    }
    mutation.mutate()
  }

  const selectClass =
    'w-full px-0 py-3 border-b border-[#0e7490] text-gray-700 focus:outline-none focus:border-[#0c6380] appearance-none bg-transparent text-base'
  const inputClass =
    'w-full px-0 py-3 border-b border-[#0e7490] text-gray-700 focus:outline-none focus:border-[#0c6380] bg-transparent text-base'

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-9999">
      <div className="bg-white w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Update Score</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Match info bar */}
        <div className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-50 text-sm">
          <span className="font-medium text-gray-800 flex items-center gap-1">
            <TeamLogo logo={match.teamA.logo || '⚽'} name={teamAName} className="w-5 h-5" textClassName="text-base" />
            {teamAName}
          </span>
          <span className="text-gray-800 font-bold">
            {match.scoreA} - {match.scoreB}
          </span>
          <span className="font-medium text-gray-800 flex items-center gap-1">
            {teamBName}
            <TeamLogo logo={match.teamB.logo || '⚽'} name={teamBName} className="w-5 h-5" textClassName="text-base" />
          </span>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4">
          <div className="flex-1 space-y-6">
            {/* Team Select */}
            <div className="relative">
              <select
                value={formData.team}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    team: e.target.value as '' | 'teamA' | 'teamB',
                    player: '',
                    assist: '',
                  })
                }
                className={selectClass}
              >
                <option value="">Select Team</option>
                <option value="teamA">{teamAName}</option>
                <option value="teamB">{teamBName}</option>
              </select>
              <ChevronDown
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={20}
              />
            </div>

            {/* Player Select */}
            <div className="relative">
              <select
                value={formData.player}
                onChange={(e) =>
                  setFormData({ ...formData, player: e.target.value })
                }
                disabled={!formData.team}
                className={selectClass + (formData.team ? '' : ' opacity-50')}
              >
                <option value="">
                  {formData.team ? 'Select Player' : 'Select team first'}
                </option>
                {playersForTeam.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={20}
              />
            </div>

            {/* Goals */}
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={10}
              placeholder="Goals (optional)"
              value={formData.goals}
              onChange={(e) =>
                setFormData({ ...formData, goals: e.target.value })
              }
              className={inputClass}
            />

            {/* Assist Select */}
            <div className="relative">
              <select
                value={formData.assist}
                onChange={(e) =>
                  setFormData({ ...formData, assist: e.target.value })
                }
                disabled={!formData.team}
                className={selectClass + (formData.team ? '' : ' opacity-50')}
              >
                <option value="">Assist (optional)</option>
                {playersForTeam
                  .filter((p) => p !== formData.player)
                  .map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
              </select>
              <ChevronDown
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={20}
              />
            </div>

            {/* Card */}
            <div className="relative">
              <select
                value={formData.card}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    card: e.target.value as '' | 'none' | 'yellow' | 'red',
                  })
                }
                className={selectClass}
              >
                <option value="">Card (optional)</option>
                <option value="yellow">Yellow Card</option>
                <option value="red">Red Card</option>
              </select>
              <ChevronDown
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={20}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-6 mt-auto">
            <button
              type="button"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="flex-1 px-6 py-3 text-base text-[#0e7490] border border-[#0e7490] rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 px-6 py-3 text-base text-white bg-[#0e7490] rounded-md hover:bg-[#0c6380] active:bg-[#0a5569] transition-colors font-medium disabled:opacity-50"
            >
              {mutation.isPending ? 'Updating…' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
