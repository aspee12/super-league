import type { CollectionConfig } from 'payload'

export const Matches: CollectionConfig = {
  slug: 'matches',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['teamA', 'teamB', 'season', 'date', 'time', 'status', 'updatedAt'],
  },
  // Every list query filters by season and sorts by date descending. Without a
  // compound index Mongo does a collection scan plus a blocking in-memory sort,
  // which degrades as seasons accumulate (and hard-fails past the 32 MB sort
  // limit). This one index serves both the filter and the sort.
  // Mongo can walk an ascending index backwards, so this also serves sort=-date.
  indexes: [{ fields: ['season', 'date'] }],
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
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      required: true,
      hasMany: false,
      index: true,
      admin: { description: 'Which season this fixture belongs to.' },
    },
    {
      name: 'date',
      type: 'text',
      required: true,
      index: true,
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
      index: true,
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
    {
      name: 'playerStats',
      type: 'array',
      label: 'Player Statistics',
      fields: [
        {
          name: 'playerName',
          type: 'text',
          required: true,
        },
        {
          name: 'team',
          type: 'select',
          required: true,
          options: [
            { label: 'Team A', value: 'teamA' },
            { label: 'Team B', value: 'teamB' },
          ],
        },
        {
          name: 'goals',
          type: 'number',
          required: true,
          defaultValue: 0,
        },
        {
          name: 'assists',
          type: 'number',
          required: true,
          defaultValue: 0,
        },
        {
          name: 'assistName',
          type: 'text',
          required: false,
        },
        {
          name: 'card',
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Yellow', value: 'yellow' },
            { label: 'Red', value: 'red' },
          ],
          defaultValue: 'none',
        },
      ],
    },
  ],
}
