export interface TeamMember {
  id: string
  name: string
  avatar?: string
  isGoalkeeper?: boolean
  // appearances: number  // TODO: re-enable when appearance tracking is added
  goals: number
  assists: number
  cleanSheets: number
}

export interface Team {
  id: string
  name: string
  icon?: string
  members: TeamMember[]
  playerCount: number
}
