import type { CollectionConfig } from 'payload'
import { cleanupMediaOnDelete, cleanupReplacedMedia } from '../lib/media-hooks'
import { defaultPlayerSeason } from '../lib/season-hooks'

export const Players: CollectionConfig = {
  slug: 'players',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'team', 'season', 'updatedAt'],
  },
  // The squad list is always "this team, this season", so index the pair.
  indexes: [{ fields: ['season', 'team'] }],
  hooks: {
    beforeChange: [defaultPlayerSeason],
    afterChange: [cleanupReplacedMedia('avatar')],
    afterDelete: [cleanupMediaOnDelete('avatar')],
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
      name: 'avatar',
      type: 'text',
      required: false,
      defaultValue: '',
    },
    {
      name: 'isGoalkeeper',
      type: 'checkbox',
      label: 'Goalkeeper',
      defaultValue: false,
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      hasMany: false,
      // Queried per-team on the Teams page, and by the team-delete cascade.
      index: true,
    },
    {
      // One document per player per season. A transfer moves the *current*
      // season's record to another club and leaves previous seasons untouched,
      // so last season's squad sheet still reads the way it did at the time.
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      required: true,
      hasMany: false,
      index: true,
      admin: {
        description:
          'The season this squad place belongs to. A player who features in two seasons has one record per season.',
      },
    },
  ],
}
