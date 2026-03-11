const API_BASE = '/api'

export type PayloadTeam = {
  id: string
  name: string
  logo?: string
  updatedAt: string
}

export type PayloadMatch = {
  id: string
  teamA: string | PayloadTeam
  teamB: string | PayloadTeam
  date: string
  time: string
  status: 'live' | 'upcoming' | 'finished'
  scoreA: number
  scoreB: number
  updatedAt: string
}

export type CreateMatchBody = {
  teamA: string
  teamB: string
  date: string
  time: string
  status?: 'live' | 'upcoming' | 'finished'
  scoreA?: number
  scoreB?: number
}

export type UpdateMatchBody = Partial<CreateMatchBody>

/** Fetch all teams from Payload (for select options). */
export async function getTeams(): Promise<PayloadTeam[]> {
  const res = await fetch(`${API_BASE}/teams?limit=500`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch teams')
  const data = await res.json()
  return data.docs ?? []
}

/** Fetch all matches from Payload. */
export async function getMatches(): Promise<PayloadMatch[]> {
  const res = await fetch(
    `${API_BASE}/matches?limit=500&depth=1`,
    { credentials: 'include' }
  )
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
    const err = await res.json().catch(() => ({})) as {
      message?: string
      errors?: Array<{ message?: string; field?: string }>
    }
    const msg =
      err.message ??
      (Array.isArray(err.errors) && err.errors.length > 0
        ? err.errors.map((e) => e.message ?? e.field).filter(Boolean).join('. ')
        : null) ??
      `Failed to create match (${res.status})`
    throw new Error(msg)
  }
  return res.json().then((d) => d.doc ?? d)
}

/** Update a match in Payload. */
export async function updateMatch(
  id: string,
  body: UpdateMatchBody
): Promise<PayloadMatch> {
  const res = await fetch(`${API_BASE}/matches/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as {
      message?: string
      errors?: Array<{ message?: string; field?: string }>
    }
    const msg =
      err.message ??
      (Array.isArray(err.errors) && err.errors.length > 0
        ? err.errors.map((e) => e.message ?? e.field).filter(Boolean).join('. ')
        : null) ??
      `Failed to update match (${res.status})`
    throw new Error(msg)
  }
  return res.json().then((d) => d.doc ?? d)
}
