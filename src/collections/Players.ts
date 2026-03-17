import type { CollectionConfig } from 'payload'

export const Players: CollectionConfig = {
  slug: 'players',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'team', 'updatedAt'],
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
