export interface TeamMember {
  id: string
  name: string
  avatar?: string
  appearances: number
  goals: number
  assists: number
}

export interface Team {
  id: string
  name: string
  icon?: string
  members: TeamMember[]
  playerCount: number
}
