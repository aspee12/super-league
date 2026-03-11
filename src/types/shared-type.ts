export interface AddMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: MatchProps | null;
    onSubmit: (data: MatchProps) => void;
    title?: string;
    submitText?: string;
    isEditMode?: boolean;
}

export interface ScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (data: ScoreProps) => void;
}

export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    confirmVariant?: 'danger' | 'primary';
  }


export interface MatchProps {
    id?: string;
    teamA: string;
    teamB: string;
    date: string;
    time: string;
}

export interface ScoreProps {
    team: string;
    player: string;
    score: string;
    assist?: string;
    card?: string;
}