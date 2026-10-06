'use client'

import { useEffect } from 'react'

/**
 * Freezes the page behind an open overlay.
 *
 * Setting `overflow: hidden` on `document.body` — the usual trick, and what
 * every modal here used to do — is a no-op in this app: the shell is a
 * `h-[100dvh]` flex column and the thing that actually scrolls is the inner
 * `[data-app-scroll]` div, so the background kept scrolling under every modal.
 *
 * Body is still locked alongside it, for the login route and anywhere else
 * rendered outside the shell.
 */

/**
 * Reference-counted so overlapping locks can't strand the page. Saving and
 * restoring the previous value per-caller looks fine until two overlays are
 * open at once: the second captures `'hidden'` as "previous" and puts it back
 * on close, leaving the app permanently unscrollable.
 */
let lockCount = 0

function applyLock() {
  const scroller = document.querySelector<HTMLElement>('[data-app-scroll]')
  if (scroller) scroller.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
}

function releaseLock() {
  const scroller = document.querySelector<HTMLElement>('[data-app-scroll]')
  if (scroller) scroller.style.overflow = ''
  document.body.style.overflow = ''
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return

    lockCount += 1
    applyLock()

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) releaseLock()
    }
  }, [active])
}
