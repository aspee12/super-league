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
  return (
    <main className="flex flex-col h-screen">
      <Header />
      <SideBar />
      {/* The mobile tab bar is fixed, so the scroll area has to reserve its
          height plus the home-indicator inset or the last row of content sits
          underneath it. */}
      <div className="flex-1 overflow-auto md:ml-44.5 md:mt-[86px] pb-[calc(4.5rem_+_env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
    </main>
  )
}
