'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSeasons, type PayloadSeason } from '@/lib/seasons-api'
import { useSeasonStore } from '@/store/seasonStore'

/**
 * Loading flag for a view whose queries are gated on `isReady`.
 *
 * A disabled React Query reports `isLoading: false`, so while the season list
 * is still in flight nothing claims to be loading and the view paints its
 * empty state — "No teams or matches yet." — over data that is on its way.
 *
 * Counting the season fetch closes that multi-second window. Checking the
 * gated queries on `isPending` rather than `isLoading` closes the frame right
 * after `enabled` flips, where the query has no data yet but has not started
 * fetching either.
 *
 * Settles if the season fetch fails: `seasonsLoading` goes false and
 * `isReady` stays false, so the empty state becomes the honest answer rather
 * than a spinner that never ends.
 */
export function seasonScopedLoading(
  seasons: { readonly isLoading: boolean; readonly isReady: boolean },
  ...gated: ReadonlyArray<{ readonly isPending: boolean }>
): boolean {
  if (seasons.isLoading) return true
  if (!seasons.isReady) return false
  return gated.some((q) => q.isPending)
}

/**
 * Season list plus the currently-viewed season.
 *
 * `viewingSeason` falls back to the active season whenever the user hasn't
 * picked one, so Table / Matches / Stats / News all default to the live
 * campaign and older seasons are reachable only through the filter.
 */
export function useSeasons() {
  const query = useQuery({
    queryKey: ['seasons'],
    queryFn: getSeasons,
    // Seasons change rarely; no need to poll aggressively.
    staleTime: 5 * 60 * 1000,
  })

  const selectedSeasonId = useSeasonStore((s) => s.selectedSeasonId)
  const setSelectedSeasonId = useSeasonStore((s) => s.setSelectedSeasonId)
  const resetSeason = useSeasonStore((s) => s.resetSeason)

  const seasons = useMemo(() => query.data ?? [], [query.data])

  const activeSeason: PayloadSeason | undefined = useMemo(
    () => seasons.find((s) => s.isActive) ?? seasons[0],
    [seasons],
  )

  const viewingSeason: PayloadSeason | undefined = useMemo(() => {
    if (!selectedSeasonId) return activeSeason
    return seasons.find((s) => s.id === selectedSeasonId) ?? activeSeason
  }, [seasons, selectedSeasonId, activeSeason])

  const isViewingActiveSeason = Boolean(
    viewingSeason && activeSeason && viewingSeason.id === activeSeason.id,
  )

  return {
    seasons,
    activeSeason,
    viewingSeason,
    viewingSeasonId: viewingSeason?.id,
    isViewingActiveSeason,
    /**
     * True once the season list has loaded successfully — guards dependent
     * queries. Must be `isSuccess`, not `!isLoading`: on error there is no
     * `viewingSeasonId`, and the dependent fetches drop their season filter
     * and pull every match across every season instead.
     */
    isReady: query.isSuccess,
    isLoading: query.isLoading,
    setSelectedSeasonId,
    resetSeason,
  }
}
