import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Viewport size, or `undefined` before the first measurement lands.
 *
 * Callers that swap between two different component trees should wait for a
 * defined value: treating the initial `undefined` as "desktop" mounts the
 * desktop tree, runs its queries, then throws it away when the effect resolves
 * to mobile — a full double mount on every page load.
 */
export function useIsMobileResolved() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

export function useIsMobile() {
  return !!useIsMobileResolved()
}
