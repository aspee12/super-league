'use client'

import { ChevronDown, RotateCw, Search, X } from 'lucide-react'
import { NEWS_CATEGORIES, NEWS_CATEGORY_CONFIG } from '@constants/news'
import type { NewsCategory } from '@/lib/news-api'
import type { NewsFilters } from '@/hooks/useNews'

export interface NewsFilterBarProps {
  readonly filters: NewsFilters
  readonly onChange: (next: NewsFilters) => void
  readonly teams: readonly { id: string; name: string }[]
  /** Stacks the controls and lets them wrap, for the mobile layout. */
  readonly compact?: boolean
}

/** True when at least one filter is narrowing the result set. */
export function hasActiveFilters(filters: NewsFilters): boolean {
  return Boolean(
    filters.category ||
      (filters.teamIds && filters.teamIds.length > 0) ||
      filters.search?.trim(),
  )
}

/** Shared shape for the 40px-high fields in the design. */
const FIELD_CLASS =
  'h-10 bg-white border border-[#00586b] rounded-[8px] text-[14px] text-[#3d3935] ' +
  'focus:outline-none focus:ring-2 focus:ring-[#267c93]/30'

function SelectField({
  label,
  value,
  onChange,
  children,
  width,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
  width: string
}) {
  return (
    <div className={`relative shrink-0 ${width}`}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${FIELD_CLASS} w-full appearance-none pl-4 pr-10 cursor-pointer`}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#3d3935]"
        aria-hidden
      />
    </div>
  )
}

export function NewsFilterBar({
  filters,
  onChange,
  teams,
  compact = false,
}: NewsFilterBarProps) {
  const active = hasActiveFilters(filters)
  const selectedTeam = filters.teamIds?.[0] ?? ''

  const set = (patch: Partial<NewsFilters>) => onChange({ ...filters, ...patch })

  return (
    <div
      className={`flex items-center gap-3 ${compact ? 'flex-wrap' : 'justify-end'}`}
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      {/* Search */}
      <div className={`relative ${compact ? 'w-full' : 'w-[220px]'} shrink-0`}>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#605e5c]"
          aria-hidden
        />
        <input
          type="search"
          aria-label="Search news"
          placeholder="Search news..."
          value={filters.search ?? ''}
          onChange={(e) => set({ search: e.target.value })}
          className={`${FIELD_CLASS} w-full pl-9 pr-3 placeholder:text-[#605e5c]`}
        />
      </div>

      <SelectField
        label="Filter by category"
        width={compact ? 'flex-1 min-w-[140px]' : 'w-[170px]'}
        value={filters.category ?? ''}
        onChange={(v) => set({ category: (v || null) as NewsCategory | null })}
      >
        <option value="">All categories</option>
        {NEWS_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {NEWS_CATEGORY_CONFIG[c].label}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Filter by team"
        width={compact ? 'flex-1 min-w-[140px]' : 'w-[170px]'}
        value={selectedTeam}
        onChange={(v) => set({ teamIds: v ? [v] : [] })}
      >
        <option value="">All teams</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </SelectField>

      <button
        type="button"
        onClick={() => onChange({})}
        disabled={!active}
        className="h-10 shrink-0 flex items-center justify-center gap-2 pl-3 pr-4 rounded-[8px]
                   bg-[#f0f0f0] border border-[#d9d9d9] text-[16px] font-bold text-black/87
                   transition-opacity hover:bg-[#e7e6e6] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ letterSpacing: '1.25px' }}
      >
        {active ? <X className="h-5 w-5" aria-hidden /> : <RotateCw className="h-5 w-5" aria-hidden />}
        Reset
      </button>
    </div>
  )
}
