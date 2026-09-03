'use client'

import { ChevronDown, RotateCw } from 'lucide-react'
import { useSeasons } from '@/hooks/useSeasons'

interface SeasonFilterProps {
  /** Hides the Reset button where space is tight. */
  readonly showReset?: boolean
  readonly className?: string
}

/**
 * Season selector shared by Table, Matches, Stats and Results.
 * Defaults to the active season; Reset returns to it.
 */
export function SeasonFilter({ showReset = true, className = '' }: SeasonFilterProps) {
  const {
    seasons,
    viewingSeasonId,
    isViewingActiveSeason,
    setSelectedSeasonId,
    resetSeason,
  } = useSeasons()

  // Nothing to switch between until more than one season exists.
  if (seasons.length === 0) return null

  return (
    <div
      className={`flex items-center gap-6 ${className}`}
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="relative w-[170px] shrink-0">
        <select
          aria-label="Filter by season"
          value={viewingSeasonId ?? ''}
          onChange={(e) => setSelectedSeasonId(e.target.value || null)}
          className="h-10 w-full appearance-none bg-white border border-[#00586b] rounded-[8px]
                     pl-4 pr-10 text-[14px] text-[#3d3935] cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-[#267c93]/30"
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#3d3935]"
          aria-hidden
        />
      </div>

      {showReset && (
        <button
          type="button"
          onClick={resetSeason}
          disabled={isViewingActiveSeason}
          className="h-10 shrink-0 flex items-center justify-center gap-2 pl-3 pr-4 rounded-[8px]
                     bg-[#f0f0f0] border border-[#d9d9d9] text-[16px] font-bold text-black/87
                     transition-opacity hover:bg-[#e7e6e6] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ letterSpacing: '1.25px' }}
        >
          <RotateCw className="h-5 w-5" aria-hidden />
          Reset
        </button>
      )}
    </div>
  )
}

/**
 * Banner shown when viewing anything other than the live season, so historical
 * data is never mistaken for the current campaign.
 */
export function ArchiveSeasonNotice() {
  const { viewingSeason, isViewingActiveSeason, resetSeason, seasons } = useSeasons()

  if (seasons.length === 0 || isViewingActiveSeason || !viewingSeason) return null

  return (
    <div
      className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#a6dfe6] bg-[#ecf9ff] px-4 py-2 text-[14px] text-[#004556]"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <span>
        You are viewing archived data for <strong>{viewingSeason.name}</strong>.
      </span>
      <button
        type="button"
        onClick={resetSeason}
        className="font-medium text-[#0e7490] underline hover:no-underline"
      >
        Back to current season
      </button>
    </div>
  )
}
