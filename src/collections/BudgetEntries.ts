import type { CollectionConfig } from 'payload'
import { defaultBudgetEntrySeason } from '../lib/season-hooks'

/**
 * Money that cannot be derived from a result: the balance carried in from last
 * season, auction purchases and sales, and manual corrections.
 *
 * Match earnings are deliberately absent. Wins and goals are recomputed from
 * the fixtures on read (see `lib/compute-budgets`), so a corrected scoreline
 * fixes the wallet by itself and no backfill can ever pay a club twice.
 */
export const BudgetEntries: CollectionConfig = {
  slug: 'budget-entries',
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['team', 'season', 'type', 'amount', 'date'],
    group: 'Budget',
  },
  // The view always asks for "this season, every club", and the team drawer
  // narrows to one club. Mirrors the compound index on players.
  indexes: [{ fields: ['season', 'team'] }],
  hooks: {
    beforeChange: [defaultBudgetEntrySeason],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      return user.permissions?.canAddTeam === true
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      return user.permissions?.canAddTeam === true
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      return user.permissions?.canAddTeam === true
    },
  },
  fields: [
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      hasMany: false,
      index: true,
    },
    {
      // One ledger per club per season. Carry-forward is recorded against the
      // season it is carried *into*, so a season's opening position is readable
      // without having to reach back into the previous campaign.
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      required: true,
      hasMany: false,
      index: true,
      admin: {
        description:
          'The season this entry belongs to. Carry-forward is recorded against the season the money is carried into.',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'purchase',
      index: true,
      options: [
        { label: 'Player bought (debit)', value: 'purchase' },
        { label: 'Player sold (credit)', value: 'sale' },
        { label: 'Carried forward (credit)', value: 'carry_forward' },
        { label: 'Manual credit', value: 'credit' },
        { label: 'Manual debit', value: 'debit' },
      ],
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        description:
          'Always a positive figure in Seltrum. The type decides whether it is added or subtracted — never enter a minus.',
      },
    },
    {
      name: 'description',
      type: 'text',
      required: false,
      defaultValue: '',
      admin: { description: 'Shown in the ledger, e.g. "Won auction for Dorji".' },
    },
    {
      // Plain 'YYYY-MM-DD', matching Matches and Seasons rather than a Date
      // column, so every date in the database sorts and compares the same way.
      name: 'date',
      type: 'text',
      required: false,
      defaultValue: '',
      index: true,
      admin: { description: 'YYYY-MM-DD. Used to order the ledger, newest first.' },
    },
  ],
}
