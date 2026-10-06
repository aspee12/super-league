'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Pencil, Trash2 } from 'lucide-react'
import { NEWS_CATEGORY_CONFIG } from '@constants/news'
import type { PayloadNews } from '@/lib/news-api'

interface NewsHeroProps {
  readonly article: PayloadNews
  readonly onEdit?: (article: PayloadNews) => void
  readonly onDelete?: (article: PayloadNews) => void
}

/** 'YYYY-MM-DD' -> '30.07.2026', matching NewsCard. */
function formatPublishedDate(value: string): string {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}.${month}.${year}`
}

/**
 * The lead story: one article given real estate so the page opens on
 * something, instead of five equal rows with no entry point.
 *
 * Image and copy sit side by side from `lg` up and stack below it, so the
 * headline never gets squeezed into a column too narrow to read.
 */
export function NewsHero({ article, onEdit, onDelete }: NewsHeroProps) {
  const category = NEWS_CATEGORY_CONFIG[article.category]
  const teamName = typeof article.team === 'object' && article.team ? article.team.name : null
  const href = `/news/${article.id}`
  const canManage = Boolean(onEdit || onDelete)

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[#a6dfe6]/60 bg-white shadow-sm"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      {/* Capped on large screens so the lead story stays a banner rather than
          a full-height block the reader has to scroll past. Below `lg` the
          image keeps its 16:9 ratio and the copy stacks underneath. */}
      <div className="flex flex-col lg:flex-row lg:h-[360px]">
        <div className="relative lg:w-[58%] shrink-0 lg:h-full">
          <Link href={href} className="block lg:h-full" aria-label={article.title}>
            <div className="relative w-full aspect-[16/9] lg:aspect-auto lg:h-full bg-[#f3f3f5] overflow-hidden">
              {article.image ? (
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  // The lead story is above the fold — fetch it eagerly so it
                  // is not the thing holding up Largest Contentful Paint.
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#605e5c] text-sm">
                  No image
                </div>
              )}
            </div>
          </Link>

          {canManage && (
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              {onEdit && (
                <button
                  type="button"
                  aria-label={`Edit ${article.title}`}
                  onClick={() => onEdit(article)}
                  className="h-8 w-8 flex items-center justify-center rounded-md bg-white/90 hover:bg-white text-[#0e7490] shadow-md"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  aria-label={`Delete ${article.title}`}
                  onClick={() => onDelete(article)}
                  className="h-8 w-8 flex items-center justify-center rounded-md bg-white/90 hover:bg-white text-red-500 hover:text-red-700 shadow-md"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center gap-3 p-5 md:p-7 lg:w-[42%]">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${category.badgeClassName}`}
            >
              {category.label}
            </span>
            {article.featured && (
              <span className="inline-flex items-center rounded-full bg-[#004556] px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase text-white">
                Top story
              </span>
            )}
          </div>

          <h2
            className="font-bold text-[22px] md:text-[28px] text-[#201f1e]"
            style={{ lineHeight: '1.25', letterSpacing: '0.15px' }}
          >
            <Link href={href} className="hover:text-[#0e7490] transition-colors">
              {article.title}
            </Link>
          </h2>

          {article.excerpt && (
            <p className="text-[15px] leading-[22px] text-[#605e5c] line-clamp-3">
              {article.excerpt}
            </p>
          )}

          <p className="text-[13px] text-[#605e5c]">
            {teamName && `${teamName} · `}
            {formatPublishedDate(article.publishedDate)}
            {article.author && ` · ${article.author}`}
          </p>
        </div>
      </div>
    </section>
  )
}
