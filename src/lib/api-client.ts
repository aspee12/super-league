/**
 * Thin `fetch` wrapper that reports authentication failures.
 *
 * Every API module goes through this so a lapsed session is noticed wherever
 * it happens, rather than each call site surfacing its own generic "Something
 * went wrong" while the UI still believes the user is signed in.
 *
 * It deliberately does not decide what a 401/403 *means* — Payload answers 403
 * both for "your token is gone" and for "you're signed in but not allowed to
 * do that". The listener re-checks `/users/me` before ending the session.
 */

type AuthFailureListener = () => void

let listener: AuthFailureListener | null = null

/** Register the handler; returns an unsubscribe function. */
export function onAuthFailure(fn: AuthFailureListener): () => void {
  listener = fn
  return () => {
    if (listener === fn) listener = null
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, { credentials: 'include', ...init })
  if (res.status === 401 || res.status === 403) listener?.()
  return res
}
