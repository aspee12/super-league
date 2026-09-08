'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

/** Pages to render either side of the current one before collapsing to an ellipsis. */
const SIBLINGS = 1

/**
 * Build the page list, collapsing long ranges: 1 … 4 [5] 6 … 20
 * Returns page numbers plus 'gap' markers for the ellipses.
 */
function buildPageRange(page: number, pageCount: number): Array<number | 'gap'> {
  // Few enough pages that everything fits — no ellipsis needed.
  if (pageCount <= 5 + SIBLINGS * 2) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  const items: Array<number | 'gap'> = [1]
  const start = Math.max(2, page - SIBLINGS)
  const end = Math.min(pageCount - 1, page + SIBLINGS)

  if (start > 2) items.push('gap')
  for (let i = start; i <= end; i++) items.push(i)
  if (end < pageCount - 1) items.push('gap')

  items.push(pageCount)
  return items
}

interface ListPaginationProps {
  /** Current page, 1-indexed. */
  readonly page: number
  readonly pageCount: number
  readonly onPageChange: (page: number) => void
  /** Optional "Showing 1–10 of 34" summary. */
  readonly summary?: string
  readonly className?: string
}

/**
 * Client-side pagination for lists already held in memory.
 *
 * The underlying shadcn `PaginationLink` renders a bare anchor, so every
 * control needs href="#" plus preventDefault to stay keyboard-focusable
 * without navigating.
 */
export function ListPagination({
  page,
  pageCount,
  onPageChange,
  summary,
  className,
}: ListPaginationProps) {
  // A single page needs no controls.
  if (pageCount <= 1) return null

  const go = (target: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    // Clamp so Previous/Next can't run past the ends.
    const next = Math.min(pageCount, Math.max(1, target))
    if (next !== page) onPageChange(next)
  }

  const disabled = 'pointer-events-none opacity-40'

  return (
    <div
      className={`flex flex-col items-center gap-2 border-t border-[#e7e6e6] px-4 py-3 ${className ?? ''}`}
    >
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={page === 1}
              className={page === 1 ? disabled : undefined}
              onClick={go(page - 1)}
            />
          </PaginationItem>

          {buildPageRange(page, pageCount).map((item, i) =>
            item === 'gap' ? (
              // Index is a safe key here: the range is positional, not identity-based.
              <PaginationItem key={`gap-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  onClick={go(item)}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={page === pageCount}
              className={page === pageCount ? disabled : undefined}
              onClick={go(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {summary && (
        <p className="text-[12px] leading-[18px] text-[#605e5c]">{summary}</p>
      )}
    </div>
  )
}

/**
 * Shared helper for the in-memory slice + clamped page maths every
 * paginated list view needs.
 */
export function paginate<T>(items: readonly T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  // Guard against a stale page after the list shrinks (filter/season change).
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * pageSize

  return {
    pageCount,
    safePage,
    /** Rank offset so numbering continues across pages. */
    offset: start,
    visible: items.slice(start, start + pageSize),
    summary: items.length
      ? `Showing ${start + 1}–${Math.min(start + pageSize, items.length)} of ${items.length}`
      : undefined,
  }
}
