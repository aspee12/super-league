import type { CollectionConfig } from 'payload'
import { cleanupMediaOnDelete, cleanupReplacedMedia } from '../lib/media-hooks'

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedDate', 'featured', 'updatedAt'],
  },
  // The news list always filters by season and sorts by publishedDate desc;
  // one compound index serves both and avoids a blocking in-memory sort.
  // Mongo can walk an ascending index backwards, so this also serves the
  // publishedDate-descending sort.
  indexes: [{ fields: ['season', 'publishedDate'] }],
  hooks: {
    afterChange: [cleanupReplacedMedia('image')],
    afterDelete: [cleanupMediaOnDelete('image')],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'super_admin',
    update: ({ req: { user } }) => user?.role === 'super_admin',
    delete: ({ req: { user } }) => user?.role === 'super_admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: false,
      defaultValue: '',
      admin: { description: 'Short summary shown on the news card.' },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'image',
      type: 'text',
      required: false,
      defaultValue: '',
      admin: { description: 'Cover image URL, set by uploading through the app.' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'club_news',
      options: [
        { label: 'Match Report', value: 'match_report' },
        { label: 'Transfer', value: 'transfer' },
        { label: 'Club News', value: 'club_news' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'Interview', value: 'interview' },
      ],
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: false,
      hasMany: false,
      admin: { description: 'Optional — the team this article relates to.' },
    },
    {
      name: 'season',
      type: 'relationship',
      relationTo: 'seasons',
      required: true,
      hasMany: false,
      index: true,
      admin: { description: 'Season the article belongs to.' },
    },
    {
      // Stored as plain 'YYYY-MM-DD' text to match the Matches collection.
      name: 'publishedDate',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured',
      defaultValue: false,
      admin: { description: 'Featured articles surface at the top of the news page.' },
    },
    {
      name: 'author',
      type: 'text',
      required: false,
      defaultValue: '',
    },
  ],
}
