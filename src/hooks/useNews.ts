'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getNews, type NewsCategory, type PayloadNews } from '@/lib/news-api'
import { useSeasons } from './useSeasons'

export type NewsFilters = {
  /** null / undefined means "All". */
  category?: NewsCategory | null
  /** Team IDs — empty means no team restriction. */
  teamIds?: string[]
  /** Inclusive 'YYYY-MM-DD' bounds. */
  dateFrom?: string | null
  dateTo?: string | null
  search?: string
}

/** Resolve the team ID off a news doc, whether populated (depth=1) or not. */
export function newsTeamId(article: PayloadNews): string | undefined {
  const { team } = article
  if (!team) return undefined
  return typeof team === 'string' ? team : team.id
}

/** Resolve the season ID off a news doc, whether populated (depth=1) or not. */
export function newsSeasonId(article: PayloadNews): string | undefined {
  const { season } = article
  if (!season) return undefined
  return typeof season === 'string' ? season : season.id
}

function matchesFilters(article: PayloadNews, filters: NewsFilters): boolean {
  const { category, teamIds, dateFrom, dateTo, search } = filters

  if (category && article.category !== category) return false

  if (teamIds && teamIds.length > 0) {
    const id = newsTeamId(article)
    if (!id || !teamIds.includes(id)) return false
  }

  // Dates are 'YYYY-MM-DD' text, so lexicographic comparison is chronological.
  if (dateFrom && article.publishedDate < dateFrom) return false
  if (dateTo && article.publishedDate > dateTo) return false

  const term = search?.trim().toLowerCase()
  if (term) {
    const haystack = [article.title, article.excerpt, article.author]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(term)) return false
  }

  return true
}

export function useNews(filters: NewsFilters = {}) {
  const { viewingSeasonId, isReady } = useSeasons()

  const query = useQuery({
    queryKey: ['news', viewingSeasonId ?? null],
    queryFn: () => getNews(viewingSeasonId),
    enabled: isReady,
    refetchInterval: 120_000,
  })

  const news = useMemo(() => query.data ?? [], [query.data])

  const teamIdsKey = filters.teamIds?.join(',')

  const filteredNews = useMemo(
    () => news.filter((article) => matchesFilters(article, filters)),
    // Depend on the filter values rather than the object identity, so callers
    // can pass an inline object literal without re-filtering on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [news, filters.category, teamIdsKey, filters.dateFrom, filters.dateTo, filters.search],
  )

  const featuredNews = useMemo(
    () => filteredNews.filter((article) => article.featured),
    [filteredNews],
  )

  return { ...query, news, filteredNews, featuredNews }
}
