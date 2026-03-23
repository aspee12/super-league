import type { CollectionConfig, CollectionAfterDeleteHook } from 'payload'

/**
 * After a Media document is deleted, remove the actual file from Vercel Blob
 * storage (production) so it doesn't accumulate and fill up the storage quota.
 * Locally this is a no-op — Payload handles local file cleanup automatically.
 */
const deleteFromBlobStorage: CollectionAfterDeleteHook = async ({ doc }) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return

  // Collect all blob URLs: the original + any generated image sizes
  const urls: string[] = []
  if (doc.url) urls.push(doc.url)
  if (doc.sizes) {
    for (const size of Object.values(doc.sizes) as Array<{ url?: string }>) {
      if (size?.url) urls.push(size.url)
    }
  }

  if (urls.length === 0) return

  try {
    // @vercel/blob is already installed as a dependency of the storage plugin
    const { del } = await import('@vercel/blob')
    await del(urls, { token: process.env.BLOB_READ_WRITE_TOKEN })
  } catch (err) {
    // Log but don't throw — the DB document is already deleted,
    // failing here would confuse the user with a false error.
    console.error('[Media] Failed to delete blob files:', err)
  }
}

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    // When BLOB_READ_WRITE_TOKEN is set (production), Vercel Blob handles storage
    // and local storage is unnecessary. Locally, we need Payload to save files to disk.
    disableLocalStorage: !!process.env.BLOB_READ_WRITE_TOKEN,
    staticDir: 'media',
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    crop: true,
  },
  hooks: {
    afterDelete: [deleteFromBlobStorage],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}
