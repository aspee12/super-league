export interface AddMatchModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: MatchProps | null
  onSubmit: (data: MatchProps) => void
  title?: string
  submitText?: string
  isEditMode?: boolean
}

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  confirmVariant?: 'danger' | 'primary'
}

export interface MatchProps {
  id?: string
  teamA: string
  teamB: string
  date: string
  time: string
  status?: 'live' | 'upcoming' | 'finished'
}
