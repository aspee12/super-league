'use client'

import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Input } from '@ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/Select'
import { updateScore } from '@/lib/matches-api'
import { getPlayersForTeam } from '@constants/team-players'
import type { Match } from '@app-types/matchTypes'

export interface UpdateScoreModalProps {
  isOpen: boolean
  onClose: () => void
  match: Match | null
}

export function UpdateScoreModal({
  isOpen,
  onClose,
  match,
}: UpdateScoreModalProps) {
  const queryClient = useQueryClient()

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
    if (isOpen) {
      setFormData({ team: '', player: '', goals: '', assist: '', card: '' })
    }
  }, [isOpen, match?.id])

  if (!isOpen || !match) return null

  const teamAName = match.teamA.name
  const teamBName = match.teamB.name

  const selectedTeamName =
    formData.team === 'teamA' ? teamAName : formData.team === 'teamB' ? teamBName : ''
  const playersForTeam = selectedTeamName ? getPlayersForTeam(selectedTeamName) : []

  const handleClose = () => {
    setFormData({ team: '', player: '', goals: '', assist: '', card: '' })
    onClose()
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Update Score</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Match info */}
        <div className="flex items-center justify-center gap-3 mb-6 text-sm text-gray-600">
          <span className="font-medium">{teamAName}</span>
          <span className="font-bold text-gray-800">
            {match.scoreA} - {match.scoreB}
          </span>
          <span className="font-medium">{teamBName}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Team */}
            <Select
              value={formData.team}
              onValueChange={(value) =>
                setFormData({ ...formData, team: value as 'teamA' | 'teamB', player: '', assist: '' })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teamA">{teamAName}</SelectItem>
                <SelectItem value="teamB">{teamBName}</SelectItem>
              </SelectContent>
            </Select>

            {/* Player */}
            <Select
              value={formData.player}
              onValueChange={(value) =>
                setFormData({ ...formData, player: value })
              }
              disabled={!formData.team}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={formData.team ? 'Select Player' : 'Select team first'} />
              </SelectTrigger>
              <SelectContent>
                {playersForTeam.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Goals */}
            <Input
              type="number"
              min={0}
              max={10}
              placeholder="Goals (optional)"
              value={formData.goals}
              onChange={(e) =>
                setFormData({ ...formData, goals: e.target.value })
              }
            />

            {/* Assist */}
            <Select
              value={formData.assist}
              onValueChange={(value) =>
                setFormData({ ...formData, assist: value })
              }
              disabled={!formData.team}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Assist (optional)" />
              </SelectTrigger>
              <SelectContent>
                {playersForTeam
                  .filter((p) => p !== formData.player)
                  .map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Card */}
            <Select
              value={formData.card}
              onValueChange={(value) =>
                setFormData({ ...formData, card: value as 'none' | 'yellow' | 'red' })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Card (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Card</SelectItem>
                <SelectItem value="yellow">Yellow Card</SelectItem>
                <SelectItem value="red">Red Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 text-sm text-white bg-[#0e7490] rounded-md hover:bg-[#0c6380] transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? 'Updating…' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
