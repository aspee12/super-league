import type { CollectionConfig } from 'payload'
import {
  cascadeDeleteTeamPlayers,
  cleanupMediaOnDelete,
  cleanupReplacedMedia,
} from '../lib/media-hooks'
import { defaultTeamSeasons } from '../lib/season-hooks'

export const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'logo', 'seasons', 'updatedAt'],
  },
  hooks: {
    beforeChange: [defaultTeamSeasons],
    // Drop the old logo when it's swapped out, so replaced images
    // don't accumulate in blob storage.
    afterChange: [cleanupReplacedMedia('logo')],
    // Delete the logo, then the team's players (which cleans up their avatars).
    afterDelete: [cleanupMediaOnDelete('logo'), cascadeDeleteTeamPlayers],
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
      return user.role === 'super_admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'text',
      required: false,
      defaultValue: '',
    },
    {
      // Which competitions the club is entered in. Without this a club founded
      // for the current season is seeded into every past season's table too,
      // showing up on nine-match-old standings with a row of zeroes.
      name: 'seasons',
      type: 'relationship',
      relationTo: 'seasons',
      hasMany: true,
      required: false,
      index: true,
      admin: {
        description:
          'Seasons this club competes in. It appears in the table, fixtures and squad list only for these seasons.',
      },
    },
  ],
}
