import type { CollectionConfig } from 'payload'
import {
  cascadeDeleteTeamPlayers,
  cleanupMediaOnDelete,
  cleanupReplacedMedia,
} from '../lib/media-hooks'

export const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'logo', 'updatedAt'],
  },
  hooks: {
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
  ],
}
