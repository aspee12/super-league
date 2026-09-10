import { computeMatchStatus } from './match-status'

const API_BASE = '/api'

export type PayloadTeam = {
  id: string
  name: string
  logo?: string
  seasons?: Array<string | PayloadSeasonRef>
  updatedAt: string
}

export type PayloadPlayerStat = {
  id?: string
  playerName: string
  team: 'teamA' | 'teamB'
  goals: number
  assists: number
  assistName?: string
  card?: 'none' | 'yellow' | 'red'
}

export type PayloadSeasonRef = {
  id: string
  name: string
  isActive?: boolean
}

export type PayloadMatch = {
  id: string

  teamA: string | PayloadTeam
  teamB: string | PayloadTeam
  season?: string | PayloadSeasonRef | null
  date: string
  time: string
  status: 'live' | 'upcoming' | 'finished'
  scoreA: number
  scoreB: number
  playerStats?: PayloadPlayerStat[]
  updatedAt: string
}

export type CreateMatchBody = {

  teamA: string
  teamB: string
  season: string
  date: string
  time: string
  status?: 'live' | 'upcoming' | 'finished'
  scoreA?: number
  scoreB?: number
}

export type UpdateMatchBody = Partial<CreateMatchBody> & {
  playerStats?: PayloadPlayerStat[]
}

/**
 * Fetch teams from Payload, optionally only those entered in one season.
 *
 * Scoping by season is what keeps a club founded this year off last year's
 * table: the standings seed a row for every club they are given, so a club that
 * never played in that season would otherwise sit there on zero points.
 */
export async function getTeams(seasonId?: string): Promise<PayloadTeam[]> {
  const params = new URLSearchParams({ limit: '500' })
  if (seasonId) {
    params.set('where[seasons][in]', seasonId)
  }
  const res = await fetch(`${API_BASE}/teams?${params}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch teams')
  const data = await res.json()
  return data.docs ?? []
}

/**
 * Fetch matches from Payload, optionally scoped to one season.
 * Filtering server-side keeps the payload small as seasons accumulate.
 */
export async function getMatches(seasonId?: string): Promise<PayloadMatch[]> {
  const params = new URLSearchParams({ limit: '500', depth: '1', sort: '-date' })
  if (seasonId) {
    params.set('where[season][equals]', seasonId)
  }
  const res = await fetch(`${API_BASE}/matches?${params}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch matches')
  const data = await res.json()
  return data.docs ?? []
}

/** Create a match in Payload. */
export async function createMatch(body: CreateMatchBody): Promise<PayloadMatch> {
  const res = await fetch(`${API_BASE}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Failed to create match'))
  }
  return res.json().then((d) => d.doc ?? d)
}

/**
 * Update a match in Payload.
 * Automatically recomputes status when date/time changes.
 */
export async function updateMatch(
  id: string,
  body: UpdateMatchBody,
): Promise<PayloadMatch> {
  // If date or time is being changed, recompute the status
  if (body.date || body.time) {
    const date = body.date ?? ''
    const time = body.time ?? ''
    const currentStatus = body.status ?? 'upcoming'
    body.status = computeMatchStatus(currentStatus, date, time)
  }

  const res = await fetch(`${API_BASE}/matches/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Failed to update match'))
  }
  return res.json().then((d) => d.doc ?? d)
}

/** End a match — just set status to finished. */
export async function endMatch(id: string): Promise<PayloadMatch> {
  const res = await fetch(`${API_BASE}/matches/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'finished' }),
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Failed to end match'))
  }
  return res.json().then((d) => d.doc ?? d)
}

/**
 * Update score for a live match.
 * Adds a player stat entry and increments the team score.
 */
export async function updateScore(
  id: string,
  currentMatch: {
    scoreA: number
    scoreB: number
    playerStats?: PayloadPlayerStat[]
  },
  stat: {
    team: 'teamA' | 'teamB'
    playerName: string
    goals: number
    assists: number
    assistName?: string
    card: 'none' | 'yellow' | 'red'
  },
): Promise<PayloadMatch> {
  const existingStats = currentMatch.playerStats ?? []
  const newStats = [...existingStats, stat]

  const scoreA =
    stat.team === 'teamA'
      ? currentMatch.scoreA + stat.goals
      : currentMatch.scoreA
  const scoreB =
    stat.team === 'teamB'
      ? currentMatch.scoreB + stat.goals
      : currentMatch.scoreB

  const res = await fetch(`${API_BASE}/matches/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scoreA, scoreB, playerStats: newStats }),
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Failed to update score'))
  }
  return res.json().then((d) => d.doc ?? d)
}

/** Delete a match from Payload. */
export async function deleteMatch(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/matches/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Failed to delete match'))
  }
}

/**
 * Update all match records that reference a player by oldName,
 * replacing with newName in both playerName and assistName fields.
 */
export async function updatePlayerNameInMatches(
  oldName: string,
  newName: string,
): Promise<void> {
  if (oldName === newName) return

  const matches = await getMatches()
  const affectedMatches = matches.filter((m) =>
    m.playerStats?.some(
      (ps) => ps.playerName === oldName || ps.assistName === oldName,
    ),
  )

  await Promise.all(
    affectedMatches.map((match) => {
      const updatedStats = match.playerStats!.map((ps) => ({
        ...ps,
        playerName: ps.playerName === oldName ? newName : ps.playerName,
        assistName: ps.assistName === oldName ? newName : ps.assistName,
      }))
      return updateMatch(match.id, { playerStats: updatedStats })
    }),
  )
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  const err = (await res.json().catch(() => ({}))) as {
    message?: string
    errors?: Array<{ message?: string; field?: string }>
  }
  return (
    err.message ??
    (Array.isArray(err.errors) && err.errors.length > 0
      ? err.errors
          .map((e) => e.message ?? e.field)
          .filter(Boolean)
          .join('. ')
      : null) ??
    `${fallback} (${res.status})`
  )
}
