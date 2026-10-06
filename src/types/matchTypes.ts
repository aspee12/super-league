export interface Team {
  id: string
  name: string
  logo: string
}

export interface PlayerStat {
  id?: string
  playerName: string
  /** The side the goal is credited to — not necessarily the player's own. */
  team: 'teamA' | 'teamB'
  goals: number
  assists: number
  assistName?: string
  card?: 'none' | 'yellow' | 'red'
  /** Set when `playerName` put it into their own net; see `lib/own-goals`. */
  isOwnGoal?: boolean | null
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
