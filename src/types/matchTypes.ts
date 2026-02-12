export interface Match {
    id: string;
    teamA: Team;
    teamB: Team;
    scoreA: number;
    scoreB: number;
    date: string;
    time: string;
    status: 'live' | 'upcoming' | 'finished';
    scorersA?: string[];
    scorersB?: string[];
}

export interface Team {
    id: string;
    name: string;
    logo: string;
  }