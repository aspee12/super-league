import {
  BUDGET_ENTRY_CONFIG,
  SELTRUM_PER_GOAL,
  SELTRUM_PER_WIN,
  type BudgetEntryType,
} from '@constants/budget'
import type { StandingEntry } from './compute-standings'
import type { Team } from '@app-types/matchTypes'

/** A stored ledger row, flattened out of the Payload document. */
export interface BudgetLedgerEntry {
  id: string
  teamId: string
  type: BudgetEntryType
  /** Always positive; `type` decides whether it adds or subtracts. */
  amount: number
  description?: string
  date?: string
  playerName?: string
}

export interface TeamBudget {
  team: Team
  /** Rank by closing balance, richest first. */
  position: number

  // --- league form, carried through so the card can show *why* ---
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  /** League points, so the user can tie the wallet back to the table. */
  points: number

  // --- earnings, recomputed from results every time ---
  fromWins: number
  fromGoals: number
  earned: number

  // --- stored ledger ---
  carryForward: number
  /** Credits excluding carry-forward, which is reported separately. */
  credits: number
  debits: number

  balance: number
  entries: BudgetLedgerEntry[]
}

export interface BudgetTotals {
  balance: number
  earned: number
  carryForward: number
  debits: number
}

/**
 * Combine league results with the stored ledger into a closing balance per club.
 *
 *   balance = carryForward + (wins x 2000) + (goals x 300) + credits - debits
 *
 * `standings` is the single source of truth for wins and goals, which means a
 * club that appears in the table with no ledger rows still gets a wallet, and
 * an admin correcting a scoreline moves the balance on the next render without
 * any backfill. Ledger rows for a club absent from `standings` are dropped —
 * that happens when a club is removed from a season after money was recorded,
 * and crediting a team that no longer competes would unbalance the totals.
 */
export function computeTeamBudgets(
  standings: StandingEntry[],
  entries: BudgetLedgerEntry[],
): TeamBudget[] {
  const byTeam = new Map<string, BudgetLedgerEntry[]>()
  for (const entry of entries) {
    const bucket = byTeam.get(entry.teamId)
    if (bucket) bucket.push(entry)
    else byTeam.set(entry.teamId, [entry])
  }

  const budgets = standings.map((row) => {
    const teamEntries = byTeam.get(row.team.id) ?? []

    let carryForward = 0
    let credits = 0
    let debits = 0

    for (const entry of teamEntries) {
      const config = BUDGET_ENTRY_CONFIG[entry.type]
      // An unrecognised type would otherwise throw on `.direction` and take
      // the whole page down; skipping keeps one bad row from hiding every wallet.
      if (!config) continue
      const amount = Math.abs(entry.amount)
      if (entry.type === 'carry_forward') carryForward += amount
      else if (config.direction === 'credit') credits += amount
      else debits += amount
    }

    const fromWins = row.won * SELTRUM_PER_WIN
    const fromGoals = row.goalsFor * SELTRUM_PER_GOAL
    const earned = fromWins + fromGoals

    return {
      team: row.team,
      position: 0,
      played: row.played,
      won: row.won,
      drawn: row.drawn,
      lost: row.lost,
      goalsFor: row.goalsFor,
      points: row.points,
      fromWins,
      fromGoals,
      earned,
      carryForward,
      credits,
      debits,
      balance: carryForward + earned + credits - debits,
      entries: [...teamEntries].sort(sortEntries),
    }
  })

  // Richest first; ties fall back to the name so the order is stable between
  // renders rather than drifting with whatever order the API returned.
  budgets.sort((a, b) => b.balance - a.balance || a.team.name.localeCompare(b.team.name))
  return budgets.map((budget, index) => ({ ...budget, position: index + 1 }))
}

/** Newest first, undated rows last. */
function sortEntries(a: BudgetLedgerEntry, b: BudgetLedgerEntry): number {
  if (!a.date && !b.date) return 0
  if (!a.date) return 1
  if (!b.date) return -1
  return b.date.localeCompare(a.date)
}

export function computeBudgetTotals(budgets: TeamBudget[]): BudgetTotals {
  return budgets.reduce<BudgetTotals>(
    (totals, budget) => ({
      balance: totals.balance + budget.balance,
      earned: totals.earned + budget.earned,
      carryForward: totals.carryForward + budget.carryForward,
      debits: totals.debits + budget.debits,
    }),
    { balance: 0, earned: 0, carryForward: 0, debits: 0 },
  )
}
