'use client'

import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { NEWS_CATEGORY_CONFIG } from '@constants/news'
import type { PayloadNews } from '@/lib/news-api'

interface NewsCardProps {
  readonly article: PayloadNews
  /** Rendered only for users allowed to manage news. */
  readonly onEdit?: (article: PayloadNews) => void
  readonly onDelete?: (article: PayloadNews) => void
}

/** 'YYYY-MM-DD' -> '30.07.2026', matching the copy used in the design. */
function formatPublishedDate(value: string): string {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}.${month}.${year}`
}

export function NewsCard({ article, onEdit, onDelete }: NewsCardProps) {
  const category = NEWS_CATEGORY_CONFIG[article.category]
  const teamName = typeof article.team === 'object' && article.team ? article.team.name : null
  const canManage = Boolean(onEdit || onDelete)
  const href = `/news/${article.id}`

  return (
    <article
      className="bg-white rounded-[8px] py-4 h-full flex flex-col"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="flex flex-col gap-2 px-4 h-full">
        <div className="relative w-full aspect-[318/182] rounded-[8px] overflow-hidden bg-[#f3f3f5] shrink-0">
          <Link href={href} className="block w-full h-full" aria-label={article.title}>
            {article.image ? (
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover transition-transform hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#605e5c] text-sm">
                No image
              </div>
            )}
          </Link>

          {canManage && (
            <div className="absolute top-2 right-2 z-10 flex gap-2">
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

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-[12px] font-medium ${category.badgeClassName}`}>
            {category.label}
          </span>
          {teamName && (
            <span className="px-2 py-0.5 rounded-full text-[12px] font-medium bg-[#f3f3f5] text-[#605e5c]">
              {teamName}
            </span>
          )}
          <span className="text-[12px] text-[#605e5c] ml-auto">
            {formatPublishedDate(article.publishedDate)}
          </span>
        </div>

        <h3
          className="font-bold text-[24px] text-black"
          style={{ lineHeight: '36px', letterSpacing: '0.25px' }}
        >
          <Link href={href} className="hover:text-[#0e7490] transition-colors">
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p
            className="text-[14px] text-black"
            style={{ lineHeight: '24px', letterSpacing: '0.5px' }}
          >
            {article.excerpt}
          </p>
        )}
      </div>
    </article>
  )
}
