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
      <div className="flex-1 overflow-auto md:ml-44.5 md:mt-[86px] md:pb-0 pb-20">
        {children}
      </div>
    </main>
  )
}
