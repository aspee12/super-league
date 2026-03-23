import type { CollectionConfig, CollectionAfterDeleteHook } from 'payload'
import { deleteMediaByUrl } from '../lib/delete-media'

/**
 * When a team is deleted, delete its logo from the Media collection
 * (which in turn triggers blob cleanup via Media's afterDelete hook).
 */
const cleanupTeamLogo: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (doc.logo) {
    await deleteMediaByUrl(req.payload, doc.logo)
  }
}

export const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'logo', 'updatedAt'],
  },
  hooks: {
    afterDelete: [cleanupTeamLogo],
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
