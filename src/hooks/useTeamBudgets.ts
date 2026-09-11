'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getBudgetEntries, type PayloadBudgetEntry } from '@/lib/budgets-api'
import {
  computeBudgetTotals,
  computeTeamBudgets,
  type BudgetLedgerEntry,
  type TeamBudget,
} from '@/lib/compute-budgets'
import { useSeasons } from './useSeasons'
import { useStandings } from './useStandings'

function toLedgerEntry(doc: PayloadBudgetEntry): BudgetLedgerEntry {
  return {
    id: doc.id,
    // Fetched at depth 0, so this is normally the raw id. Handle the populated
    // shape too — the same helper is reused if a caller ever raises the depth.
    teamId: typeof doc.team === 'string' ? doc.team : doc.team?.id,
    type: doc.type,
    amount: doc.amount ?? 0,
    description: doc.description || undefined,
    date: doc.date || undefined,
  }
}

/**
 * Season-scoped Seltrum wallets for every club in the table.
 *
 * Earnings ride on `useStandings` rather than fetching matches again: the
 * standings query is already running on most screens, already season-scoped,
 * and already the definitive count of wins and goals. Reusing it means the
 * wallet cannot disagree with the table.
 */
export function useTeamBudgets() {
  const {
    seasons,
    viewingSeason,
    viewingSeasonId,
    isReady,
    isLoading: seasonsLoading,
  } = useSeasons()
  const { standings, isLoading: standingsLoading } = useStandings()

  const entriesQuery = useQuery({
    queryKey: ['budget-entries', viewingSeasonId ?? null],
    queryFn: () => getBudgetEntries(viewingSeasonId),
    enabled: isReady,
    // The ledger only moves when an admin records something, so poll lazily —
    // the earnings half of the balance is already refreshed by useStandings.
    refetchInterval: 120_000,
  })

  const budgets: TeamBudget[] = useMemo(() => {
    const entries = (entriesQuery.data ?? []).map(toLedgerEntry)
    return computeTeamBudgets(standings, entries)
  }, [standings, entriesQuery.data])

  const totals = useMemo(() => computeBudgetTotals(budgets), [budgets])

  /**
   * The season immediately before the one on show — the campaign this season's
   * carry-forward came out of. Seasons are ordered by `order`, so this is the
   * highest order below the current one rather than the neighbouring array
   * index, which would be wrong wherever a season has been removed.
   */
  const previousSeason = useMemo(() => {
    if (!viewingSeason) return undefined
    return seasons
      .filter((s) => s.order < viewingSeason.order)
      .sort((a, b) => b.order - a.order)[0]
  }, [seasons, viewingSeason])

  /** Clubs that carried money in, richest first — the carry-forward sheet. */
  const carryForward = useMemo(
    () =>
      budgets
        .filter((b) => b.carryForward > 0)
        .sort((a, b) => b.carryForward - a.carryForward),
    [budgets],
  )

  return {
    budgets,
    totals,
    carryForward,
    previousSeason,
    /**
     * The season list has to be counted here. Every query below it is gated on
     * `isReady`, and a disabled React Query reports `isLoading: false` — so
     * while seasons are still in flight nothing claims to be loading and the
     * view paints "no budgets" over data that is on its way. If the season
     * fetch fails this still settles: `seasonsLoading` goes false, the empty
     * state is then the honest answer rather than a spinner that never ends.
     */
    isLoading: seasonsLoading || standingsLoading || entriesQuery.isLoading,
    isError: entriesQuery.isError,
    error: entriesQuery.error as Error | null,
  }
}
