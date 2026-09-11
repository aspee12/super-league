import { useState } from "react"

/**
 * Runs `reset` during render on the closed -> open transition.
 *
 * This is React's "adjusting state when a prop changes" pattern. Doing the same
 * work in an effect trips react-hooks/set-state-in-effect and costs an extra
 * render pass, so the dialog paints one frame of stale values before the reset
 * lands.
 *
 * `reset` is read fresh on every render and only called on the transition, so
 * it does not need to be memoised by the caller.
 */
export function useResetOnOpen(isOpen: boolean, reset: () => void) {
  const [wasOpen, setWasOpen] = useState(false)

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) reset()
  }
}
