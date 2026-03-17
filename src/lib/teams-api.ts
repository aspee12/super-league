const API_BASE = '/api'

/** Upload a file to the media collection. Returns the URL path. */
export async function uploadMedia(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  // Payload REST API expects additional fields via _payload JSON string
  formData.append(
    '_payload',
    JSON.stringify({ alt: file.name }),
  )

  const res = await fetch(`${API_BASE}/media`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })
  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`Failed to upload image (${res.status}): ${errBody}`)
  }
  const data = await res.json()
  const doc = data.doc ?? data
  // Return the URL path for the uploaded file
  return doc.url as string
}

export type PayloadPlayer = {
  id: string
  name: string
  avatar?: string
  team: string | { id: string; name: string; logo?: string }
  updatedAt: string
}

/** Fetch all players, optionally filtered by team ID. */
export async function getPlayers(teamId?: string): Promise<PayloadPlayer[]> {
  const params = new URLSearchParams({ limit: '500', depth: '1' })
  if (teamId) {
    params.set('where[team][equals]', teamId)
  }
  const res = await fetch(`${API_BASE}/players?${params}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch players')
  const data = await res.json()
  return data.docs ?? []
}

/** Create a new team. */
export async function createTeam(body: { name: string; logo?: string }): Promise<{ id: string; name: string; logo?: string }> {
  const res = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to create team'))
  return res.json().then((d) => d.doc ?? d)
}

/** Update a team. */
export async function updateTeam(id: string, body: { name?: string; logo?: string }): Promise<{ id: string; name: string; logo?: string }> {
  const res = await fetch(`${API_BASE}/teams/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to update team'))
  return res.json().then((d) => d.doc ?? d)
}

/** Delete a team. */
export async function deleteTeam(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/teams/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to delete team'))
}

/** Create a player. */
export async function createPlayer(body: { name: string; avatar?: string; team: string }): Promise<PayloadPlayer> {
  const res = await fetch(`${API_BASE}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to create player'))
  return res.json().then((d) => d.doc ?? d)
}

/** Update a player. */
export async function updatePlayer(id: string, body: { name?: string; avatar?: string; team?: string }): Promise<PayloadPlayer> {
  const res = await fetch(`${API_BASE}/players/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to update player'))
  return res.json().then((d) => d.doc ?? d)
}

/** Delete a player. */
export async function deletePlayer(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/players/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to delete player'))
}

/** Transfer a player to another team. */
export async function transferPlayer(id: string, toTeamId: string): Promise<PayloadPlayer> {
  return updatePlayer(id, { team: toTeamId })
}

async function extractErr(res: Response, fallback: string): Promise<string> {
  const err = (await res.json().catch(() => ({}))) as {
    message?: string
    errors?: Array<{ message?: string; field?: string }>
  }
  return (
    err.message ??
    (Array.isArray(err.errors) && err.errors.length > 0
      ? err.errors.map((e) => e.message ?? e.field).filter(Boolean).join('. ')
      : null) ??
    `${fallback} (${res.status})`
  )
}
