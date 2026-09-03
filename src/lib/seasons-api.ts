const API_BASE = '/api'

export type PayloadSeason = {
  id: string
  name: string
  order: number
  startDate?: string
  endDate?: string
  isActive?: boolean
  updatedAt: string
  createdAt: string
}

/** Fetch all seasons, newest first. */
export async function getSeasons(): Promise<PayloadSeason[]> {
  const res = await fetch(`${API_BASE}/seasons?limit=100&sort=-order`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch seasons')
  const data = await res.json()
  return data.docs ?? []
}

/** Resolve the id off a relationship field, whether populated or not. */
export function seasonId(
  value: string | { id: string } | null | undefined,
): string | undefined {
  if (!value) return undefined
  return typeof value === 'string' ? value : value.id
}
