import type { CollectionConfig } from 'payload'

export const Teams: CollectionConfig = {
  slug: 'teams',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'logo', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
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
      defaultValue: '🏆',
    },
  ],
}
