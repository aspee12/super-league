import { ArrowDownLeft, ArrowUpRight, Gavel, PiggyBank, SlidersHorizontal, type LucideIcon } from 'lucide-react'

/**
 * Seltrum paid for a win. A win is worth 3 league points; a draw earns its
 * league point but no Seltrum, and a defeat earns neither.
 */
export const SELTRUM_PER_WIN = 2000

/** Seltrum paid for every goal a club scores, win or lose. */
export const SELTRUM_PER_GOAL = 300

export const CURRENCY_NAME = 'Seltrum'

/**
 * Ledger entry kinds.
 *
 * Match earnings are deliberately *not* in this list — they are recomputed
 * from the fixtures every time the page loads (see `compute-budgets`). Storing
 * them would mean a corrected scoreline leaves a stale credit behind, and a
 * re-run of any backfill would pay a club twice. Only money that cannot be
 * derived from a result lives here.
 */
export type BudgetEntryType =
  | 'carry_forward'
  | 'sale'
  | 'credit'
  | 'purchase'
  | 'debit'

export interface BudgetEntryConfig {
  readonly label: string
  /** Short form for tight mobile rows. */
  readonly shortLabel: string
  readonly icon: LucideIcon
  /** `credit` adds to the balance, `debit` subtracts. */
  readonly direction: 'credit' | 'debit'
  readonly className: string
}

/**
 * Amounts are always stored positive; direction lives here rather than in the
 * sign. An admin typing a purchase should never have to remember a minus.
 */
export const BUDGET_ENTRY_CONFIG: Record<BudgetEntryType, BudgetEntryConfig> = {
  carry_forward: {
    label: 'Carried forward',
    shortLabel: 'Carried',
    icon: PiggyBank,
    direction: 'credit',
    className: 'text-[#0e7490]',
  },
  sale: {
    label: 'Player sold',
    shortLabel: 'Sold',
    icon: ArrowUpRight,
    direction: 'credit',
    className: 'text-emerald-600',
  },
  credit: {
    label: 'Manual credit',
    shortLabel: 'Credit',
    icon: SlidersHorizontal,
    direction: 'credit',
    className: 'text-emerald-600',
  },
  purchase: {
    label: 'Player bought',
    shortLabel: 'Bought',
    icon: Gavel,
    direction: 'debit',
    className: 'text-rose-600',
  },
  debit: {
    label: 'Manual debit',
    shortLabel: 'Debit',
    icon: ArrowDownLeft,
    direction: 'debit',
    className: 'text-rose-600',
  },
}

/** Ordered for admin dropdowns — the two auction types first, they are the common case. */
export const BUDGET_ENTRY_TYPES: readonly BudgetEntryType[] = [
  'purchase',
  'sale',
  'carry_forward',
  'credit',
  'debit',
]

export function isCredit(type: BudgetEntryType): boolean {
  return BUDGET_ENTRY_CONFIG[type].direction === 'credit'
}

/**
 * Thousands-separated Seltrum. The locale is pinned rather than left to the
 * browser: these components render on the server too, and a client whose
 * locale groups differently would trip a hydration mismatch on every figure.
 */
export function formatSeltrum(amount: number): string {
  return Math.round(amount).toLocaleString('en-US')
}

/** `formatSeltrum` with an explicit +/- for ledger rows. */
export function formatSignedSeltrum(amount: number, direction: 'credit' | 'debit'): string {
  return `${direction === 'credit' ? '+' : '−'}${formatSeltrum(Math.abs(amount))}`
}
