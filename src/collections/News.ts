import type { CollectionConfig, CollectionAfterDeleteHook } from 'payload'
import { deleteMediaByUrl } from '../lib/delete-media'

/**
 * When a news article is deleted, delete its cover image from the Media
 * collection (which in turn triggers blob cleanup via Media's afterDelete hook).
 */
const cleanupNewsImage: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (doc.image) {
    await deleteMediaByUrl(req.payload, doc.image)
  }
}

export const News: CollectionConfig = {
  slug: 'news',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedDate', 'featured', 'updatedAt'],
  },
  hooks: {
    afterDelete: [cleanupNewsImage],
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
      admin: { description: 'Season the article belongs to.' },
    },
    {
      // Stored as plain 'YYYY-MM-DD' text to match the Matches collection.
      name: 'publishedDate',
      type: 'text',
      required: true,
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
