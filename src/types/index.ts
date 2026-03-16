export type { Team, Match, MatchStatus } from './matchTypes'
export type { PlayerStat as MatchPlayerStat } from './matchTypes'

export interface Player {
  id: string
  name: string
  team: string
  avatar: string
}

export interface TableEntry {
  pos: number
  team: { id: string; name: string; logo: string }
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string[]
}

export interface PlayerStat {
  id: string
  player: Player
  goals: number
}

export interface TeamMember {
  id: string
  player: Player
  appearances: number
  goals: number
  assists: number
}
