export interface Team {
  id: string
  name: string
  logo: string
}

export interface PlayerStat {
  id?: string
  playerName: string
  team: 'teamA' | 'teamB'
  goals: number
  assists: number
  assistName?: string
  card?: 'none' | 'yellow' | 'red'
}

export type MatchStatus = 'live' | 'upcoming' | 'finished'

export interface Match {
  id: string
  teamA: Team
  teamB: Team
  scoreA: number
  scoreB: number
  date: string
  time: string
  status: MatchStatus
  playerStats?: PlayerStat[]
}
