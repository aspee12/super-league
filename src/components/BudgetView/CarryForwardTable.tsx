'use client'

import { PiggyBank } from 'lucide-react'
import { TeamLogo } from '@shared-component/TeamLogo'
import { CURRENCY_NAME, formatSeltrum } from '@constants/budget'
import type { TeamBudget } from '@/lib/compute-budgets'

/**
 * The carry-forward sheet: what each club brought into this season.
 *
 * Two columns only, so it stays a real table all the way down to a phone
 * rather than needing the sideways scroll the league table resorts to.
 */
export function CarryForwardTable({
  budgets,
  fromSeasonName,
}: {
  readonly budgets: TeamBudget[]
  readonly fromSeasonName?: string
}) {
  const total = budgets.reduce((sum, b) => sum + b.carryForward, 0)

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[#a6dfe6] bg-white shadow-sm"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <header className="flex items-center gap-2 border-b border-[#e3f4f8] px-4 py-3">
        <PiggyBank className="h-4 w-4 shrink-0 text-[#0e7490]" aria-hidden />
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold text-[#201f1e]">Carry forward</h2>
          <p className="truncate text-[11px] text-[#605e5c]">
            {fromSeasonName
              ? `Brought in from ${fromSeasonName}`
              : 'Brought in from the previous season'}
          </p>
        </div>
      </header>

      {budgets.length === 0 ? (
        <p className="px-4 py-6 text-center text-[13px] text-[#605e5c]">
          No carry-forward recorded for this season yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <caption className="sr-only">
              {CURRENCY_NAME} carried forward into this season by club
            </caption>
            <thead>
              <tr className="bg-[#0e7490] text-white">
                <th scope="col" className="px-4 py-2.5 text-left text-[12px] font-semibold">
                  Team name
                </th>
                <th scope="col" className="px-4 py-2.5 text-right text-[12px] font-semibold">
                  Carry forward
                </th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget, index) => (
                <tr
                  key={budget.team.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#fafcfd]'}
                >
                  <th scope="row" className="px-4 py-2.5 text-left font-normal">
                    <span className="flex min-w-0 items-center gap-2">
                      <TeamLogo
                        logo={budget.team.logo}
                        name={budget.team.name}
                        className="h-5 w-5"
                        textClassName="text-base"
                      />
                      <span className="truncate text-[#201f1e]">{budget.team.name}</span>
                    </span>
                  </th>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-[#00586b]">
                    {formatSeltrum(budget.carryForward)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#a6dfe6] bg-[#ecf9ff]">
                <th scope="row" className="px-4 py-2.5 text-left text-[12px] font-semibold text-[#00586b]">
                  Total
                </th>
                <td className="px-4 py-2.5 text-right text-[13px] font-bold tabular-nums text-[#00586b]">
                  {formatSeltrum(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  )
}
