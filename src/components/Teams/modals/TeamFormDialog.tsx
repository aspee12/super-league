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

interface TeamFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; file: File | null }) => void
  mode?: "add" | "edit"
  initialName?: string
  initialFile?: File | null
  /** Existing logo URL for edit mode preview */
  existingLogoUrl?: string
}

export function TeamFormDialog({
  isOpen,
  onClose,
  onSubmit,
  mode = "add",
  initialName = "",
  initialFile = null,
  existingLogoUrl,
}: TeamFormDialogProps) {
  const [teamName, setTeamName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showExisting, setShowExisting] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setTeamName(initialName)
      setSelectedFile(initialFile)
      setShowExisting(true)
    }
  }, [isOpen, initialName, initialFile])

  const handleSubmit = () => {
    if (!teamName.trim()) return
    onSubmit({ name: teamName, file: selectedFile })
    handleClose()
  }

  const handleClose = () => {
    setTeamName("")
    setSelectedFile(null)
    setShowExisting(true)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Team" : "Edit Team"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">
              {mode === "add" ? "Team Name" : "Change Name"}
            </Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
            />
          </div>
          <div className="space-y-2">
            <Label>{mode === "add" ? "Team Logo" : "Change Logo"}</Label>
            <FileUpload
              file={selectedFile}
              onFileChange={setSelectedFile}
              id={mode === "add" ? "new-team-file-upload" : "team-file-upload"}
              existingImageUrl={showExisting ? existingLogoUrl : undefined}
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
            disabled={!teamName.trim()}
          >
            {mode === "add" ? "Add" : "Change"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
