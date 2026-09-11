import { apiFetch } from './api-client'

const API_BASE = '/api'

export type NewsCategory =
  | 'match_report'
  | 'transfer'
  | 'club_news'
  | 'announcement'
  | 'interview'

export type PayloadNews = {
  id: string
  title: string
  excerpt?: string
  content: string
  image?: string
  category: NewsCategory
  team?: string | { id: string; name: string; logo?: string } | null
  season: string | { id: string; name: string; isActive?: boolean } | null
  /** Plain 'YYYY-MM-DD' text, matching the Matches collection. */
  publishedDate: string
  featured?: boolean
  author?: string
  updatedAt: string
  createdAt: string
}

export type CreateNewsBody = {
  title: string
  excerpt?: string
  content: string
  image?: string
  category: NewsCategory
  team?: string
  /** Season document id. */
  season: string
  publishedDate: string
  featured?: boolean
  author?: string
}

export type UpdateNewsBody = Partial<CreateNewsBody>

/** Fetch news articles from Payload, newest first, optionally scoped to a season. */
export async function getNews(seasonId?: string): Promise<PayloadNews[]> {
  const params = new URLSearchParams({
    limit: '500',
    depth: '1',
    sort: '-publishedDate',
  })
  if (seasonId) {
    params.set('where[season][equals]', seasonId)
  }
  const res = await apiFetch(`${API_BASE}/news?${params}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch news')
  const data = await res.json()
  return data.docs ?? []
}

/** Fetch a single news article by id. Returns null when it doesn't exist. */
export async function getNewsById(id: string): Promise<PayloadNews | null> {
  const res = await apiFetch(`${API_BASE}/news/${id}?depth=1`, { credentials: 'include' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch article')
  return res.json()
}

/** Create a news article. */
export async function createNews(body: CreateNewsBody): Promise<PayloadNews> {
  const res = await apiFetch(`${API_BASE}/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to create news article'))
  return res.json().then((d) => d.doc ?? d)
}

/** Update a news article. */
export async function updateNews(id: string, body: UpdateNewsBody): Promise<PayloadNews> {
  const res = await apiFetch(`${API_BASE}/news/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to update news article'))
  return res.json().then((d) => d.doc ?? d)
}

/** Delete a news article. */
export async function deleteNews(id: string): Promise<void> {
  const res = await apiFetch(`${API_BASE}/news/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await extractErr(res, 'Failed to delete news article'))
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
