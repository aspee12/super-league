export interface TeamMember {
  id: string
  name: string
  avatar?: string
  // appearances: number  // TODO: re-enable when appearance tracking is added
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
