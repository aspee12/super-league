const API_BASE = '/api'

export type LoginBody = { email: string; password: string }
export type LoginResponse = { user: { id: string; email: string; role: string; permissions?: { canAddTeam?: boolean } } }
export type MeResponse = LoginResponse['user']

/** Payload error response: { message?: string, errors?: Array<{ message?: string, field?: string }> }. Use when parsing API error JSON for toasts. */
export function getBackendErrorMessage(body: unknown): string {
  if (!body || typeof body !== 'object') return 'Something went wrong'
  const b = body as { message?: string; errors?: Array<{ message?: string; field?: string }> }
  if (typeof b.message === 'string' && b.message.trim()) return b.message.trim()
  if (Array.isArray(b.errors) && b.errors.length > 0) {
    const messages = b.errors
      .map((e) => (typeof e.message === 'string' ? e.message.trim() : ''))
      .filter(Boolean)
    if (messages.length) return messages.join('. ')
  }
  return 'Something went wrong'
}

/** Payload login returns { user, token?, exp? } */
export async function login(body: LoginBody): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  })
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    const message = getBackendErrorMessage(errBody)
    throw new Error(message)
  }
  return res.json()
}

export async function me(): Promise<MeResponse | null> {
  const res = await fetch(`${API_BASE}/users/me`, {
    credentials: 'include',
  })
  if (!res.ok) return null
  const data = await res.json()
  return data?.user ?? null
}

export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/users/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}
