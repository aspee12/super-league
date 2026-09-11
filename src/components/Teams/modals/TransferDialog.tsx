"use client"

import { useState } from "react"
import { useResetOnOpen } from "@/hooks/useResetOnOpen"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GoalkeeperBadge } from "@shared-component/GoalkeeperBadge"

interface Team {
  id: string
  name: string
}

interface TransferDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    playerId: string
    fromTeamId: string
    toTeamId: string
    stats: { goals: number; assists: number }
  }) => void
  player: {
    id: string
    name: string
    avatar?: string
    isGoalkeeper?: boolean
    goals: number
    assists: number
  } | null
  currentTeamId: string
  teams: Team[]
}

export function TransferDialog({
  isOpen,
  onClose,
  onSubmit,
  player,
  currentTeamId,
  teams,
}: TransferDialogProps) {
  const [playerName, setPlayerName] = useState("")
  const [playerStats, setPlayerStats] = useState({
    goals: 0,
    assists: 0,
  })
  const [transferToTeam, setTransferToTeam] = useState<string>("")

  useResetOnOpen(isOpen, () => {
    if (!player) return
    setPlayerName(player.name)
    setPlayerStats({
      goals: player.goals,
      assists: player.assists,
    })
    setTransferToTeam("")
  })

  const handleSubmit = () => {
    if (!player || !transferToTeam) return
    onSubmit({
      playerId: player.id,
      fromTeamId: currentTeamId,
      toTeamId: transferToTeam,
      stats: playerStats,
    })
    handleClose()
  }

  const handleClose = () => {
    setPlayerName("")
    setTransferToTeam("")
    setPlayerStats({ goals: 0, assists: 0 })
    onClose()
  }

  const availableTeams = teams.filter((team) => team.id !== currentTeamId)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transfer</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="transfer-player-name" className="flex items-center gap-2">
              Player Name
              {player?.isGoalkeeper && <GoalkeeperBadge />}
            </Label>
            <Input
              id="transfer-player-name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
              disabled
            />
          </div>
          {player && (
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={player.avatar} alt={player.name} />
                  <AvatarFallback>
                    {player.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {/* <div className="space-y-2">
              <Label htmlFor="transfer-appearance">Appearance</Label>
              <Input
                id="transfer-appearance"
                type="number"
                value={0}
                disabled
              />
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="transfer-goal">Goal</Label>
              <Input
                id="transfer-goal"
                type="number"
                value={playerStats.goals}
                onChange={(e) =>
                  setPlayerStats({
                    ...playerStats,
                    goals: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-assists">Assists</Label>
              <Input
                id="transfer-assists"
                type="number"
                value={playerStats.assists}
                onChange={(e) =>
                  setPlayerStats({
                    ...playerStats,
                    assists: Number.parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-to">Transfer to</Label>
            <Select value={transferToTeam} onValueChange={setTransferToTeam}>
              <SelectTrigger id="transfer-to">
                <SelectValue placeholder="Team name" />
              </SelectTrigger>
              <SelectContent>
                {availableTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-gray-200 text-gray-900 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#267c93] hover:bg-[#1e6477] text-white"
            disabled={!transferToTeam}
          >
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
