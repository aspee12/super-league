'use client'

import type { ReactNode } from 'react'
import Header from './Header'
import SideBar from './SideBar'

/**
 * Header + sidebar chrome shared by every signed-in page. Extracted so routes
 * outside the `[slug]` catch-all (e.g. the news article page) render inside
 * the same frame without duplicating it.
 */
export function AppShell({ children }: { readonly children: ReactNode }) {
  // `100dvh`, not `100vh`: on iOS Safari `vh` is the *large* viewport — the
  // height with the toolbars retracted — so a `100vh` shell extends below the
  // visible area and its bottom padding lands behind the browser chrome,
  // leaving content clipped under the fixed tab bar. `dvh` tracks the height
  // actually on screen.
  return (
    <main className="flex flex-col h-[100dvh]">
      <Header />
      <SideBar />
      {/* Both bars are fixed, so the scroll area reserves the header height at
          the top and the tab bar plus home-indicator inset at the bottom. */}
      <div
        data-app-scroll
        className="flex-1 overflow-auto md:ml-44.5 pt-20 md:pt-0 md:mt-[86px] pb-[calc(4.5rem_+_env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
    </main>
  )
}
