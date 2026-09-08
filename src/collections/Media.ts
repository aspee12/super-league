import type { CollectionConfig, CollectionAfterDeleteHook } from 'payload'

/**
 * After a Media document is deleted, remove the actual file from Vercel Blob
 * storage (production) so it doesn't accumulate and fill up the storage quota.
 * Locally this is a no-op — Payload handles local file cleanup automatically.
 */
const deleteFromBlobStorage: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Without the token neither this hook nor the storage plugin (which is
    // only registered when the token exists) can call `del`. If DATABASE_URL
    // points at the shared cloud database, the record is now gone while its
    // blob lives on forever, with no DB row left to find it by. Say so loudly
    // rather than returning silently — this is how orphans accumulated.
    if (doc?.url?.startsWith?.('http')) {
      req.payload.logger.warn(
        `[Media] Deleted "${doc.filename}" but BLOB_READ_WRITE_TOKEN is not set, ` +
          `so the remote blob was NOT removed: ${doc.url} — run "npm run blobs:prune" to reclaim it.`,
      )
    }
    return
  }

  // Collect all blob URLs: the original + any generated image sizes.
  //
  // `imageSizes` is no longer configured, but documents uploaded before that
  // change still carry `sizes`, so keep clearing them to reclaim the old blobs.
  //
  // This duplicates the storage plugin's own afterDelete hook, but it is not
  // redundant: the plugin rebuilds each URL from the raw filename without
  // percent-encoding, so it fails on any filename containing a space (very
  // common — "WhatsApp Image ....jpeg"). Using the already-encoded `doc.url`
  // works for those. Both run; `del` is idempotent. Do not remove this.
  const urls: string[] = []
  if (doc.url) urls.push(doc.url)
  if (doc.sizes) {
    for (const size of Object.values(doc.sizes) as Array<{ url?: string }>) {
      if (size?.url) urls.push(size.url)
    }
  }

  if (urls.length === 0) return

  try {
    // Declared directly in package.json — this import must not rely on the
    // storage plugin happening to hoist it.
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
    // No `imageSizes`: the cloud-storage plugin writes one blob per generated
    // size, so every extra size multiplied our Blob usage. Nothing in the app
    // ever read `sizes.thumbnail` / `sizes.card` — the UI always uses `doc.url`
    // — so they were pure storage waste (3 blobs stored per 1 image used).
    // Adding a size here again means paying for it on every single upload.
    focalPoint: false,
    crop: false,
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
