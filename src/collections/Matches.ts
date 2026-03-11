import type { CollectionConfig } from 'payload'

export const Matches: CollectionConfig = {
  slug: 'matches',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['teamA', 'teamB', 'date', 'time', 'status', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'teamA',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      hasMany: false,
    },
    {
      name: 'teamB',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      hasMany: false,
    },
    {
      name: 'date',
      type: 'text',
      required: true,
    },
    {
      name: 'time',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'upcoming',
      options: [
        { label: 'Live', value: 'live' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Finished', value: 'finished' },
      ],
    },
    {
      name: 'scoreA',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'scoreB',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
  ],
}
