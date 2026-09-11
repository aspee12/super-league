'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Coins, Plus, PiggyBank, TrendingUp, Wallet } from 'lucide-react'
import { useTeamBudgets } from '@/hooks/useTeamBudgets'
import { useSeasons } from '@/hooks/useSeasons'
import { useAuthStore } from '@/store/authStore'
import { FullPageLoader } from '@shared-component/FullPageLoader'
import { ArchiveSeasonNotice, SeasonFilter } from '@shared-component/SeasonFilter'
import { Button } from '@/components/ui/button'
import {
  CURRENCY_NAME,
  SELTRUM_PER_GOAL,
  SELTRUM_PER_WIN,
  formatSeltrum,
} from '@constants/budget'
import { createBudgetEntry, type CreateBudgetEntryBody } from '@/lib/budgets-api'
import { TeamBudgetCard } from './TeamBudgetCard'
import { CarryForwardTable } from './CarryForwardTable'
import { BudgetEntryDialog } from './BudgetEntryDialog'
import type { Team } from '@app-types/matchTypes'

/** One figure in the summary strip. Two-up on a phone, four-up from `sm`. */
function SummaryTile({
  label,
  value,
  icon: Icon,
}: {
  readonly label: string
  readonly value: string
  readonly icon: typeof Wallet
}) {
  return (
    <div className="rounded-xl border border-[#a6dfe6] bg-white px-3 py-2.5 shadow-sm sm:px-4 sm:py-3">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0 text-[#0e7490]" aria-hidden />
        <p className="truncate text-[10px] font-medium uppercase tracking-wide text-[#605e5c] sm:text-[11px]">
          {label}
        </p>
      </div>
      <p className="mt-1 text-[18px] font-bold tabular-nums leading-tight text-[#00586b] sm:text-[22px]">
        {value}
      </p>
    </div>
  )
}

export function BudgetView() {
  const { budgets, totals, carryForward, previousSeason, isLoading } = useTeamBudgets()
  const { viewingSeasonId, isViewingActiveSeason } = useSeasons()
  const canAddTeam = useAuthStore((s) => s.canAddTeam)
  const queryClient = useQueryClient()

  // Archived seasons are read-only, as they are on the Teams page. Back-dating
  // a purchase into a finished campaign would silently restate a table that has
  // already been published.
  const canManage = canAddTeam() && isViewingActiveSeason

  const [isDialogOpen, setDialogOpen] = useState(false)

  const teams: Team[] = useMemo(() => budgets.map((b) => b.team), [budgets])

  const createMutation = useMutation({
    mutationFn: (body: Omit<CreateBudgetEntryBody, 'season'>) =>
      // Pin the season being viewed rather than letting the collection hook
      // default to the active one — an admin correcting an archived season
      // would otherwise silently post the entry into the live campaign.
      createBudgetEntry({ ...body, season: viewingSeasonId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-entries'] })
      setDialogOpen(false)
      toast.success('Transaction recorded')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (isLoading) {
    return <FullPageLoader message="Loading budgets..." />
  }

  return (
    <div
      className="min-h-full px-4 pt-6 pb-8 md:px-6 lg:px-8"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      {/* Title + controls. Stacks on a phone, sits on one line from `md`. */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold text-[#201f1e] md:text-[24px]">Team Budget</h1>
          <p className="mt-0.5 text-[12px] text-[#605e5c] md:text-[13px]">
            {formatSeltrum(SELTRUM_PER_WIN)} {CURRENCY_NAME} per win ·{' '}
            {formatSeltrum(SELTRUM_PER_GOAL)} per goal
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SeasonFilter showReset={false} />
          {canManage && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="h-10 shrink-0 bg-[#267c93] text-white hover:bg-[#1e6477]"
            >
              <Plus className="mr-1 h-4 w-4" aria-hidden />
              Record
            </Button>
          )}
        </div>
      </div>

      <ArchiveSeasonNotice />

      {budgets.length === 0 ? (
        <div className="rounded-2xl border border-[#a6dfe6] bg-white px-4 py-12 text-center">
          <Wallet className="mx-auto h-8 w-8 text-[#a6dfe6]" aria-hidden />
          <p className="mt-3 text-[14px] font-medium text-[#201f1e]">No budgets to show</p>
          <p className="mt-1 text-[12px] text-[#605e5c]">
            Budgets appear once clubs are entered into this season.
          </p>
        </div>
      ) : (
        <>
          {/* League-wide totals */}
          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            <SummaryTile
              label="In circulation"
              value={formatSeltrum(totals.balance)}
              icon={Wallet}
            />
            <SummaryTile
              label="Earned"
              value={formatSeltrum(totals.earned)}
              icon={TrendingUp}
            />
            <SummaryTile
              label="Carried in"
              value={formatSeltrum(totals.carryForward)}
              icon={PiggyBank}
            />
            <SummaryTile label="Spent" value={formatSeltrum(totals.debits)} icon={Coins} />
          </div>

          {/* Wallets. One column on a phone, two from `md`, three on a wide
              desktop — the cards carry a breakdown, so a fourth column would
              squeeze the working out of the rows. */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {budgets.map((budget) => (
              <TeamBudgetCard key={budget.team.id} budget={budget} />
            ))}
          </div>

          <div className="mt-6 max-w-2xl">
            <CarryForwardTable budgets={carryForward} fromSeasonName={previousSeason?.name} />
          </div>
        </>
      )}

      {canManage && (
        <BudgetEntryDialog
          isOpen={isDialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          teams={teams}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  )
}

export default BudgetView
