import type { NewsCategory } from '@/lib/news-api'

export interface NewsCategoryConfig {
  /** Full label, used in dropdowns and desktop filters. */
  label: string
  /** Badge colours applied to the category pill on a news card. */
  badgeClassName: string
}

export const NEWS_CATEGORY_CONFIG: Record<NewsCategory, NewsCategoryConfig> = {
  match_report: {
    label: 'Match Report',
    badgeClassName: 'bg-[#c5e6d4] text-[#0c5273]',
  },
  transfer: {
    label: 'Transfer',
    badgeClassName: 'bg-[#c5dce6] text-[#0c5273]',
  },
  club_news: {
    label: 'Club News',
    badgeClassName: 'bg-[#e0f2f7] text-[#0e7490]',
  },
  announcement: {
    label: 'Announcement',
    badgeClassName: 'bg-[#ecf9ff] text-[#004556]',
  },
  interview: {
    label: 'Interview',
    badgeClassName: 'bg-[#f3f3f5] text-[#605e5c]',
  },
}

export const NEWS_CATEGORIES = Object.keys(NEWS_CATEGORY_CONFIG) as NewsCategory[]
