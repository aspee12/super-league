import { NEWS_CATEGORIES, NEWS_CATEGORY_CONFIG } from '@constants/news'
import type { NewsCategory, PayloadNews } from '@/lib/news-api'

/**
 * Stories per rail. Past this the reader is better served by opening the
 * category than by scrolling sideways forever.
 */
export const RAIL_LIMIT = 12

export interface NewsRailGroup {
  readonly category: NewsCategory
  readonly label: string
  readonly articles: PayloadNews[]
}

/**
 * Split articles into one group per category, in the order the categories are
 * declared so the page keeps a stable shape as stories come and go. Empty
 * categories drop out rather than rendering a headed, empty row.
 */
export function groupIntoRails(
  articles: PayloadNews[],
  excludeId?: string,
): NewsRailGroup[] {
  const byCategory = new Map<NewsCategory, PayloadNews[]>()
  for (const article of articles) {
    if (article.id === excludeId) continue
    const list = byCategory.get(article.category)
    if (list) list.push(article)
    else byCategory.set(article.category, [article])
  }

  return NEWS_CATEGORIES.map((category) => ({
    category,
    label: NEWS_CATEGORY_CONFIG[category].label,
    articles: (byCategory.get(category) ?? []).slice(0, RAIL_LIMIT),
  })).filter((group) => group.articles.length > 0)
}

/**
 * The lead story: the newest flagged as featured, falling back to the newest
 * article. The API sorts by `-publishedDate`, so first match is newest.
 */
export function pickHero(articles: PayloadNews[]): PayloadNews | undefined {
  return articles.find((article) => article.featured) ?? articles[0]
}
