"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteTeamDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  teamName?: string
}

export function DeleteTeamDialog({
  isOpen,
  onClose,
  onConfirm,
  teamName,
}: DeleteTeamDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Team</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-base">
          {teamName
            ? `Are you sure you want to delete "${teamName}"?`
            : "Are you sure you want to delete this team?"}
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-700 hover:bg-blue-800 text-white"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
