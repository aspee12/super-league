"use client"

import { useState } from "react"
import { useResetOnOpen } from "@/hooks/useResetOnOpen"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BUDGET_ENTRY_CONFIG,
  BUDGET_ENTRY_TYPES,
  CURRENCY_NAME,
  formatSeltrum,
  type BudgetEntryType,
} from "@constants/budget"
import type { CreateBudgetEntryBody } from "@/lib/budgets-api"
import type { Team } from "@app-types/matchTypes"

interface BudgetEntryDialogProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSubmit: (data: Omit<CreateBudgetEntryBody, "season">) => void
  readonly teams: readonly Team[]
  /** Preselects a club when opened from that club's card. */
  readonly initialTeamId?: string
  readonly isSubmitting?: boolean
}

/** Local midnight as YYYY-MM-DD, matching how every other date is stored. */
function today(): string {
  const now = new Date()
  const month = `${now.getMonth() + 1}`.padStart(2, "0")
  const day = `${now.getDate()}`.padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

export function BudgetEntryDialog({
  isOpen,
  onClose,
  onSubmit,
  teams,
  initialTeamId,
  isSubmitting = false,
}: BudgetEntryDialogProps) {
  const [teamId, setTeamId] = useState("")
  const [type, setType] = useState<BudgetEntryType>("purchase")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")

  useResetOnOpen(isOpen, () => {
    setTeamId(initialTeamId ?? teams[0]?.id ?? "")
    setType("purchase")
    setAmount("")
    setDescription("")
    setDate(today())
  })

  const parsedAmount = Number(amount)
  const isValid =
    teamId !== "" && amount.trim() !== "" && Number.isFinite(parsedAmount) && parsedAmount > 0

  const handleSubmit = () => {
    if (!isValid || isSubmitting) return
    onSubmit({
      team: teamId,
      type,
      // Stored positive; `type` carries the direction. Guard anyway so a pasted
      // "-5000" becomes a debit of 5000 rather than a credit.
      amount: Math.abs(parsedAmount),
      description: description.trim() || undefined,
      date: date || undefined,
    })
  }

  const selectClass =
    "h-10 w-full appearance-none rounded-[8px] border border-[#00586b] bg-white px-3 " +
    "text-[14px] text-[#3d3935] focus:outline-none focus:ring-2 focus:ring-[#267c93]/30"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Record a transaction</DialogTitle>
          <DialogDescription>
            Match earnings are worked out from results automatically. Record only money that
            results cannot explain — auction moves, carry-forward and corrections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="budget-team">Team</Label>
            <select
              id="budget-team"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className={selectClass}
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-type">Type</Label>
            <select
              id="budget-type"
              value={type}
              onChange={(e) => setType(e.target.value as BudgetEntryType)}
              className={selectClass}
            >
              {BUDGET_ENTRY_TYPES.map((value) => (
                <option key={value} value={value}>
                  {BUDGET_ENTRY_CONFIG[value].label}
                  {BUDGET_ENTRY_CONFIG[value].direction === "debit" ? " (−)" : " (+)"}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-amount">Amount ({CURRENCY_NAME})</Label>
            <Input
              id="budget-amount"
              type="number"
              inputMode="numeric"
              min={0}
              step={50}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
            <p className="text-[11px] text-[#605e5c]">
              {isValid
                ? `${BUDGET_ENTRY_CONFIG[type].direction === "debit" ? "Subtracts" : "Adds"} ${formatSeltrum(Math.abs(parsedAmount))} ${CURRENCY_NAME}.`
                : "Enter a positive figure — the type decides the direction."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-description">Note (optional)</Label>
            <Input
              id="budget-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Won auction for Dorji"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-date">Date</Label>
            <Input
              id="budget-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#267c93] text-white hover:bg-[#1e6477]"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
