import type { CollectionConfig, CollectionAfterDeleteHook } from 'payload'
import { deleteMediaByUrl } from '../lib/delete-media'

/**
 * When a player is deleted, delete their avatar from the Media collection
 * (which in turn triggers blob cleanup via Media's afterDelete hook).
 */
const cleanupPlayerAvatar: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (doc.avatar) {
    await deleteMediaByUrl(req.payload, doc.avatar)
  }
}

export const Players: CollectionConfig = {
  slug: 'players',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'team', 'updatedAt'],
  },
  hooks: {
    afterDelete: [cleanupPlayerAvatar],
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
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      hasMany: false,
    },
  ],
}
