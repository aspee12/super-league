export interface AddMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: MatchProps) => void;
}

export interface ScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (data: ScoreProps) => void;
}


export interface MatchProps {
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