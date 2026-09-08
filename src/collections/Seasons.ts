import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'

/**
 * Only one season may be active at a time. When a season is flipped to active,
 * clear the flag on every other season. The context flag stops the nested
 * update from re-triggering this hook.
 */
const ensureSingleActiveSeason: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  if (!doc.isActive) return
  if (context?.skipActiveSeasonSync) return

  await req.payload.update({
    collection: 'seasons',
    where: {
      and: [{ isActive: { equals: true } }, { id: { not_equals: doc.id } }],
    },
    data: { isActive: false },
    context: { skipActiveSeasonSync: true },
    overrideAccess: true,
  })
}

export const Seasons: CollectionConfig = {
  slug: 'seasons',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'order', 'startDate', 'endDate', 'isActive'],
  },
  hooks: {
    afterChange: [ensureSingleActiveSeason],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'super_admin',
    update: ({ req: { user } }) => user?.role === 'super_admin',
    delete: ({ req: { user } }) => user?.role === 'super_admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Display name, e.g. "Season 3".' },
    },
    {
      // Drives ordering in the season dropdown — highest first.
      name: 'order',
      type: 'number',
      // Seasons are always fetched sorted by order.
      index: true,
      required: true,
      defaultValue: 1,
      admin: { description: 'Sort order; the newest season should have the highest number.' },
    },
    {
      // Plain 'YYYY-MM-DD' text, matching the Matches collection.
      name: 'startDate',
      type: 'text',
      required: false,
      defaultValue: '',
    },
    {
      name: 'endDate',
      type: 'text',
      required: false,
      defaultValue: '',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Active season',
      defaultValue: false,
      admin: {
        description:
          'The season shown by default across Table, Matches, Stats and News. Turning this on turns it off everywhere else.',
      },
    },
  ],
}
