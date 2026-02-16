"use client"

import { useState, useEffect } from "react"
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
import { FileUpload } from "./FileUpload"

interface AddMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; file: File | null }) => void
}

export function AddMemberDialog({
  isOpen,
  onClose,
  onSubmit,
}: AddMemberDialogProps) {
  const [playerName, setPlayerName] = useState("")
  const [playerPicture, setPlayerPicture] = useState<File | null>(null)

  useEffect(() => {
    if (isOpen) {
      setPlayerName("")
      setPlayerPicture(null)
    }
  }, [isOpen])

  const handleSubmit = () => {
    if (!playerName.trim()) return
    onSubmit({ name: playerName, file: playerPicture })
    handleClose()
  }

  const handleClose = () => {
    setPlayerName("")
    setPlayerPicture(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="player-name">Player Name</Label>
            <Input
              id="player-name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
            />
          </div>
          <div className="space-y-2">
            <Label>Player Picture</Label>
            <FileUpload
              file={playerPicture}
              onFileChange={setPlayerPicture}
              id="player-picture-upload"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#267c93] hover:bg-[#1e6477] text-white"
            disabled={!playerName.trim()}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
