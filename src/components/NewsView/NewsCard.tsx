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

/**
 * Image-led card: the photo carries the card and the text sits directly on the
 * section background beneath it — no surrounding panel.
 */
export function NewsCard({ article, onEdit, onDelete }: NewsCardProps) {
  const category = NEWS_CATEGORY_CONFIG[article.category]
  const teamName = typeof article.team === 'object' && article.team ? article.team.name : null
  const canManage = Boolean(onEdit || onDelete)
  const href = `/news/${article.id}`

  return (
    <article className="h-full flex flex-col" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <div className="relative w-full aspect-[16/9] rounded-[8px] overflow-hidden bg-[#f3f3f5] shrink-0">
        <Link href={href} className="block w-full h-full" aria-label={article.title}>
          {article.image ? (
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.03]"
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

      <h3
        className="mt-3 font-bold text-[18px] text-[#201f1e]"
        style={{ lineHeight: '24px', letterSpacing: '0.15px' }}
      >
        <Link href={href} className="hover:text-[#0e7490] transition-colors">
          {article.title}
        </Link>
      </h3>

      <p className="mt-1.5 text-[13px] text-[#605e5c]">
        {category.label}
        {teamName && ` · ${teamName}`}
        {` · ${formatPublishedDate(article.publishedDate)}`}
      </p>
    </article>
  )
}
