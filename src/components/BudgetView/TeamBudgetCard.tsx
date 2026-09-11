'use client'

import { useId, useState } from 'react'
import { ChevronDown, Trophy } from 'lucide-react'
import { TeamLogo } from '@shared-component/TeamLogo'
import {
  BUDGET_ENTRY_CONFIG,
  CURRENCY_NAME,
  SELTRUM_PER_GOAL,
  SELTRUM_PER_WIN,
  formatSeltrum,
  formatSignedSeltrum,
} from '@constants/budget'
import type { TeamBudget } from '@/lib/compute-budgets'

/** One "label / working / amount" line in the breakdown. */
function BreakdownRow({
  label,
  working,
  amount,
  tone = 'neutral',
}: {
  readonly label: string
  readonly working?: string
  readonly amount: string
  readonly tone?: 'neutral' | 'credit' | 'debit'
}) {
  const amountTone =
    tone === 'credit'
      ? 'text-emerald-600'
      : tone === 'debit'
        ? 'text-rose-600'
        : 'text-[#201f1e]'

  return (
    <div className="flex items-baseline justify-between gap-2 py-1.5">
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="truncate text-[13px] text-[#605e5c]">{label}</span>
        {working && (
          <span className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-[#8a8886]">
            {working}
          </span>
        )}
      </div>
      <span className={`shrink-0 text-[13px] font-semibold tabular-nums ${amountTone}`}>
        {amount}
      </span>
    </div>
  )
}

export function TeamBudgetCard({ budget }: { readonly budget: TeamBudget }) {
  const [showLedger, setShowLedger] = useState(false)
  const ledgerId = useId()
  const hasLedger = budget.entries.length > 0

  return (
    <article
      className="flex flex-col rounded-2xl border border-[#a6dfe6] bg-white shadow-sm
                 transition-shadow hover:shadow-md"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      {/* Header: rank, crest, name, league points */}
      <header className="flex items-center gap-3 border-b border-[#e3f4f8] px-4 py-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                     bg-[#ecf9ff] text-[12px] font-bold tabular-nums text-[#00586b]"
          aria-label={`Rank ${budget.position} by balance`}
        >
          {budget.position}
        </span>
        <TeamLogo
          logo={budget.team.logo}
          name={budget.team.name}
          className="h-8 w-8"
          textClassName="text-2xl"
        />
        <h3 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#201f1e]">
          {budget.team.name}
        </h3>
        {/* The points that generated the money, so the wallet ties back to the table. */}
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#ecf9ff] px-2.5 py-1">
          <Trophy className="h-3.5 w-3.5 text-[#0e7490]" aria-hidden />
          <span className="text-[12px] font-bold tabular-nums text-[#00586b]">
            {budget.points}
          </span>
          <span className="text-[11px] text-[#605e5c]">pts</span>
        </span>
      </header>

      {/* Balance — the headline figure */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#605e5c]">
          Available balance
        </p>
        <p
          className={`mt-0.5 text-[28px] font-bold leading-tight tabular-nums sm:text-[32px] ${
            budget.balance < 0 ? 'text-rose-600' : 'text-[#0e7490]'
          }`}
        >
          {formatSeltrum(budget.balance)}
          <span className="ml-1.5 text-[13px] font-medium text-[#605e5c]">
            {CURRENCY_NAME}
          </span>
        </p>
        <p className="mt-1 text-[11px] tabular-nums text-[#8a8886]">
          {budget.played} played · {budget.won}W {budget.drawn}D {budget.lost}L ·{' '}
          {budget.goalsFor} scored
        </p>
      </div>

      {/* How the balance was reached */}
      <div className="border-t border-[#f0f6f8] px-4 py-2">
        <BreakdownRow
          label="From wins"
          working={`${budget.won} × ${formatSeltrum(SELTRUM_PER_WIN)}`}
          amount={formatSeltrum(budget.fromWins)}
        />
        <BreakdownRow
          label="From goals"
          working={`${budget.goalsFor} × ${formatSeltrum(SELTRUM_PER_GOAL)}`}
          amount={formatSeltrum(budget.fromGoals)}
        />
        <div className="my-1 border-t border-dashed border-[#e3f4f8]" />
        <BreakdownRow
          label="Earned this season"
          amount={formatSeltrum(budget.earned)}
          tone="credit"
        />
        {budget.carryForward > 0 && (
          <BreakdownRow
            label="Carried forward"
            amount={formatSignedSeltrum(budget.carryForward, 'credit')}
            tone="credit"
          />
        )}
        {budget.credits > 0 && (
          <BreakdownRow
            label="Sales & credits"
            amount={formatSignedSeltrum(budget.credits, 'credit')}
            tone="credit"
          />
        )}
        {budget.debits > 0 && (
          <BreakdownRow
            label="Purchases & debits"
            amount={formatSignedSeltrum(budget.debits, 'debit')}
            tone="debit"
          />
        )}
      </div>

      {/* Ledger — collapsed by default; on a phone this is the difference
          between a readable card and a wall of rows. */}
      {hasLedger && (
        <div className="mt-auto border-t border-[#f0f6f8]">
          <button
            type="button"
            onClick={() => setShowLedger((open) => !open)}
            aria-expanded={showLedger}
            aria-controls={ledgerId}
            className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left
                       text-[12px] font-medium text-[#0e7490] transition-colors
                       hover:bg-[#f7fcfd] rounded-b-2xl
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#267c93]/40"
          >
            <span>
              {showLedger ? 'Hide' : 'Show'} {budget.entries.length}{' '}
              {budget.entries.length === 1 ? 'transaction' : 'transactions'}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${showLedger ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>

          {showLedger && (
            <ul id={ledgerId} className="space-y-1 px-4 pb-3">
              {budget.entries.map((entry) => {
                const config = BUDGET_ENTRY_CONFIG[entry.type]
                if (!config) return null
                const Icon = config.icon
                return (
                  <li
                    key={entry.id}
                    className="flex items-start justify-between gap-2 rounded-lg bg-[#fafcfd] px-2.5 py-2"
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${config.className}`} aria-hidden />
                      <div className="min-w-0">
                        <p className="truncate text-[12px] text-[#201f1e]">
                          {entry.description || config.label}
                        </p>
                        <p className="text-[10px] text-[#8a8886]">
                          {config.label}
                          {entry.date ? ` · ${entry.date}` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 text-[12px] font-semibold tabular-nums ${config.className}`}
                    >
                      {formatSignedSeltrum(entry.amount, config.direction)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </article>
  )
}
