'use client'

import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { FullPageLoader } from '@shared-component/FullPageLoader'
import { NEWS_CATEGORY_CONFIG } from '@constants/news'
import { useNewsArticle } from '@/hooks/useNews'
import type { PayloadNews } from '@/lib/news-api'

/** 'YYYY-MM-DD' -> '03 Sep 2026', matching the publication-date style. */
function formatLongDate(value: string): string {
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return value
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`
}

function LatestNewsRail({ articles }: { readonly articles: PayloadNews[] }) {
  if (articles.length === 0) return null

  return (
    <aside className="w-full lg:w-[320px] shrink-0">
      <div className="bg-white rounded-[8px] border border-[#e7e6e6] p-4">
        <h2
          className="font-bold text-[16px] text-[#004556] mb-3"
          style={{ letterSpacing: '0.15px' }}
        >
          Latest News
        </h2>
        <ul className="flex flex-col divide-y divide-[#e7e6e6]">
          {articles.map((item) => (
            <li key={item.id}>
              <Link
                href={`/news/${item.id}`}
                className="flex gap-3 items-start py-3 group"
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-medium text-[#201f1e] leading-[20px] group-hover:text-[#0e7490] line-clamp-3">
                    {item.title}
                  </span>
                  <span className="block text-[12px] text-[#605e5c] mt-1">
                    {NEWS_CATEGORY_CONFIG[item.category].label}
                  </span>
                </span>
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    aria-hidden
                    className="w-[72px] h-[48px] rounded-[4px] object-cover shrink-0"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}

export function NewsArticleView({ articleId }: { readonly articleId: string }) {
  const { article, latest, isLoading, isError } = useNewsArticle(articleId)

  if (isLoading) return <FullPageLoader message="Loading article..." />

  if (isError || !article) {
    return (
      <div className="min-h-screen flex-1 p-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-[#0e7490] hover:underline text-sm"
        >
          <ChevronLeft size={16} />
          Back to News
        </Link>
        <p className="text-center py-20 text-gray-500">
          This article could not be found. It may have been deleted.
        </p>
      </div>
    )
  }

  const category = NEWS_CATEGORY_CONFIG[article.category]
  const teamName = typeof article.team === 'object' && article.team ? article.team.name : null
  // Body copy is plain text; blank lines separate paragraphs.
  const paragraphs = article.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div
      className="min-h-screen flex-1 p-4 md:p-6"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-[#0e7490] hover:underline text-sm mb-4"
      >
        <ChevronLeft size={16} />
        Back to News
      </Link>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <article className="flex-1 min-w-0 max-w-[760px]">
          {/* Meta above the headline */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`px-2 py-0.5 rounded-full text-[12px] font-medium ${category.badgeClassName}`}
            >
              {category.label}
            </span>
            {teamName && (
              <span className="px-2 py-0.5 rounded-full text-[12px] font-medium bg-[#f3f3f5] text-[#605e5c]">
                {teamName}
              </span>
            )}
            <span className="text-[14px] text-[#605e5c]">
              {formatLongDate(article.publishedDate)}
            </span>
          </div>

          <h1
            className="font-bold text-[28px] md:text-[40px] text-[#004556] mb-4"
            style={{ lineHeight: 1.2, letterSpacing: '0.25px' }}
          >
            {article.title}
          </h1>

          {article.image && (
            <div className="w-full aspect-[16/9] rounded-[8px] overflow-hidden bg-[#f3f3f5] mb-5">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* No standfirst: `excerpt` is auto-derived from the first 160 chars
              of `content`, so rendering it here would repeat the opening line. */}
          <div className="flex flex-col gap-4">
            {paragraphs.map((text) =>
              text.startsWith('## ') ? (
                <h2
                  key={text.slice(0, 48)}
                  className="font-bold text-[20px] text-[#004556] mt-2"
                  style={{ lineHeight: '30px', letterSpacing: '0.25px' }}
                >
                  {text.slice(3).trim()}
                </h2>
              ) : (
                <p
                  key={text.slice(0, 48)}
                  className="text-[16px] text-[#201f1e]"
                  style={{ lineHeight: '28px', letterSpacing: '0.5px' }}
                >
                  {text}
                </p>
              ),
            )}
          </div>

          {article.author && (
            <p className="mt-6 pt-4 border-t border-[#e7e6e6] text-[14px] text-[#605e5c]">
              By {article.author}
            </p>
          )}
        </article>

        <LatestNewsRail articles={latest} />
      </div>
    </div>
  )
}
