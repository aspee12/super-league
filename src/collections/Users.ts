import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'updatedAt'],
  },
  access: {
    admin: () => true,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      return user.id === id
    },
    delete: ({ req: { user } }) => user?.role === 'super_admin',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.email && typeof data.email === 'string') {
          ;(data as Record<string, unknown>).email = data.email.toLowerCase().trim()
        }
      },
      ({ data, req: { user }, operation }) => {
        if (!user || user.role === 'super_admin') return
        if (operation === 'update' && data) {
          delete (data as Record<string, unknown>).role
          delete (data as Record<string, unknown>).permissions
        }
      },
    ],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      saveToJWT: true,
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
    {
      name: 'permissions',
      type: 'group',
      saveToJWT: true,
      fields: [
        {
          name: 'canAddTeam',
          type: 'checkbox',
          label: 'Can Add Team',
          defaultValue: false,
        },
      ],
    },
  ],
}
