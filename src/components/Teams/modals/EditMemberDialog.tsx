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

interface EditMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; file: File | null }) => void
  initialName?: string
  existingAvatarUrl?: string
}

export function EditMemberDialog({
  isOpen,
  onClose,
  onSubmit,
  initialName = "",
  existingAvatarUrl,
}: EditMemberDialogProps) {
  const [playerName, setPlayerName] = useState("")
  const [playerPicture, setPlayerPicture] = useState<File | null>(null)
  const [showExisting, setShowExisting] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setPlayerName(initialName)
      setPlayerPicture(null)
      setShowExisting(true)
    }
  }, [isOpen, initialName])

  const handleSubmit = () => {
    if (!playerName.trim()) return
    onSubmit({ name: playerName, file: playerPicture })
    handleClose()
  }

  const handleClose = () => {
    setPlayerName("")
    setPlayerPicture(null)
    setShowExisting(true)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-player-name">Player Name</Label>
            <Input
              id="edit-player-name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name"
            />
          </div>
          <div className="space-y-2">
            <Label>Player Photo</Label>
            <FileUpload
              file={playerPicture}
              onFileChange={setPlayerPicture}
              id="edit-player-picture-upload"
              existingImageUrl={showExisting ? existingAvatarUrl : undefined}
              onClearExisting={() => setShowExisting(false)}
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
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
