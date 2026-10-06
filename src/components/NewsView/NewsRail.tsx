'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PayloadNews } from '@/lib/news-api'
import { NewsCard } from './NewsCard'

interface NewsRailProps {
  readonly title: string
  readonly articles: PayloadNews[]
  /** Jumps to the filtered grid for this category. */
  readonly onSeeAll?: () => void
  readonly onEdit?: (article: PayloadNews) => void
  readonly onDelete?: (article: PayloadNews) => void
}

/**
 * One horizontally-scrolling row of articles, the way a league site groups its
 * newsroom: a heading per category with the stories running off the right edge
 * rather than a single flat grid that buries everything behind "View More".
 *
 * The track is the scroller and carries its own gutter via a negative margin,
 * so a card bleeds to the panel edge instead of being clipped short of it.
 */
export function NewsRail({ title, articles, onSeeAll, onEdit, onDelete }: NewsRailProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const syncArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    // 1px of slack: fractional layout widths never land exactly on the bound.
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft < max - 1)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    syncArrows()
    el.addEventListener('scroll', syncArrows, { passive: true })
    // Width changes (viewport resize, images settling) move the bounds too.
    const observer = new ResizeObserver(syncArrows)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', syncArrows)
      observer.disconnect()
    }
  }, [syncArrows, articles.length])

  const scrollByPage = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    // Just under a full width, so the card at the boundary stays in view and
    // the reader keeps their place.
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  if (articles.length === 0) return null

  const isScrollable = canScrollLeft || canScrollRight
  const arrow =
    'flex h-9 w-9 items-center justify-center rounded-full border border-[#a6dfe6] bg-white text-[#004556] transition-colors hover:bg-[#ecf9ff] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white'

  return (
    <section className="rounded-2xl border border-[#a6dfe6]/60 bg-[#ecf9ff]/75 p-4 md:p-5">
      <header className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-baseline gap-3 min-w-0">
          <h2
            className="font-bold text-[20px] md:text-[22px] text-[#004556] truncate"
            style={{ letterSpacing: '0.25px' }}
          >
            {title}
          </h2>
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="shrink-0 -my-2 py-2 px-1 -mx-1 text-[13px] font-semibold text-[#0e7490] hover:underline"
            >
              See all
            </button>
          )}
        </div>

        {isScrollable && (
          // Shown on touch too — swiping works, but the arrows are the visible
          // cue that the row continues past the edge.
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className={arrow}
              onClick={() => scrollByPage(-1)}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${title} back`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={arrow}
              onClick={() => scrollByPage(1)}
              disabled={!canScrollRight}
              aria-label={`Scroll ${title} forward`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </header>

      <div
        ref={trackRef}
        className="-mx-4 md:-mx-5 px-4 md:px-5 flex gap-4 overflow-x-auto scroll-smooth
                   snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {articles.map((article) => (
          <div
            key={article.id}
            className="shrink-0 snap-start w-[250px] sm:w-[270px] lg:w-[290px]"
          >
            <NewsCard article={article} onEdit={onEdit} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </section>
  )
}
