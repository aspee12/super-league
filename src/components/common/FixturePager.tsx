'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface FixturePagerProps {
  /** Current page, 1-indexed. */
  readonly page: number
  readonly pageCount: number
  readonly onPageChange: (page: number) => void
  /** Main caption, e.g. "Matchweek 2". */
  readonly label: string
  /** Optional second line, e.g. the date range covered by this page. */
  readonly subLabel?: string
  readonly className?: string
}

/**
 * Premier-League-style prev/next stepper for a windowed fixture list.
 *
 * Unlike `ListPagination` this shows no page numbers — just a caption flanked
 * by two arrows — which suits a short list shown a couple of fixtures at a
 * time. Renders nothing when everything already fits on one page.
 */
export function FixturePager({
  page,
  pageCount,
  onPageChange,
  label,
  subLabel,
  className,
}: FixturePagerProps) {
  // The caption names the matchweek, so it stays even when there's nothing to
  // step through — only the arrows are conditional.
  const showArrows = pageCount > 1

  const arrow =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0e7490] text-white transition-colors hover:bg-[#0c6380] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#0e7490]'

  return (
    <div className={`flex items-center justify-center gap-4 ${className ?? ''}`}>
      {showArrows && (
        <button
          type="button"
          className={arrow}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous matchweek"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      <div className="min-w-[150px] text-center">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {subLabel && <p className="text-xs text-gray-500">{subLabel}</p>}
      </div>

      {showArrows && (
        <button
          type="button"
          className={arrow}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next matchweek"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  )
}

/** "11 Sep" — short, locale-independent label for a "YYYY-MM-DD" string. */
function formatShortDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`)
  if (isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/**
 * Date range covered by a page of fixtures, collapsing to a single date when
 * they all fall on the same day.
 */
export function fixtureDateRange(matches: ReadonlyArray<{ date: string }>): string | undefined {
  if (matches.length === 0) return undefined

  const first = formatShortDate(matches[0].date)
  const last = formatShortDate(matches[matches.length - 1].date)
  return first === last ? first : `${first} – ${last}`
}
