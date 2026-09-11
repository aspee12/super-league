import { apiFetch } from './api-client'
import type { BudgetEntryType } from '@constants/budget'

const API_BASE = '/api'

export type PayloadBudgetEntry = {
  id: string
  team: string | { id: string; name: string; logo?: string }
  season: string | { id: string; name: string } | null
  type: BudgetEntryType
  amount: number
  description?: string
  date?: string
  updatedAt: string
  createdAt: string
}

export type CreateBudgetEntryBody = {
  team: string
  season?: string
  type: BudgetEntryType
  amount: number
  description?: string
  date?: string
}

/**
 * Every ledger row for a season.
 *
 * `depth: 0` on purpose — the view already holds the season's clubs from the
 * standings query and matches on id, so populating the team relationship would
 * re-send each club's document once per entry for nothing.
 */
export async function getBudgetEntries(seasonId?: string): Promise<PayloadBudgetEntry[]> {
  const params = new URLSearchParams({ limit: '1000', depth: '0', sort: '-date' })
  if (seasonId) params.set('where[season][equals]', seasonId)

  const res = await apiFetch(`${API_BASE}/budget-entries?${params}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch budget entries')
  const data = await res.json()
  return data.docs ?? []
}

export async function createBudgetEntry(
  body: CreateBudgetEntryBody,
): Promise<PayloadBudgetEntry> {
  const res = await apiFetch(`${API_BASE}/budget-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to record entry'))
  return res.json().then((d) => d.doc ?? d)
}

export async function updateBudgetEntry(
  id: string,
  body: Partial<CreateBudgetEntryBody>,
): Promise<PayloadBudgetEntry> {
  const res = await apiFetch(`${API_BASE}/budget-entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to update entry'))
  return res.json().then((d) => d.doc ?? d)
}

export async function deleteBudgetEntry(id: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}/budget-entries/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to delete entry'))
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
