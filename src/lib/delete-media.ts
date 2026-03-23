import type { Payload } from 'payload'

/**
 * Find a Media document by its URL and delete it via Payload's API.
 * Deleting through Payload (not directly from the DB) ensures that
 * the Media collection's afterDelete hook fires, which handles
 * removing the actual file from Vercel Blob storage.
 *
 * Used by Teams and Players afterDelete hooks to clean up orphaned images.
 */
export async function deleteMediaByUrl(
  payload: Payload,
  url: string,
): Promise<void> {
  try {
    // Extract the filename from the URL.
    // Local URLs look like:  /api/media/file/image.png
    // Blob URLs look like:   https://xxxx.public.blob.vercel-storage.com/image.png
    const filename = url.split('/').pop()
    if (!filename) return

    // Find the Media document whose filename matches
    const result = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
    })

    if (result.docs.length === 0) return

    // Delete via Payload API — this triggers the afterDelete hook
    // on Media, which removes the file from Vercel Blob storage.
    await payload.delete({
      collection: 'media',
      id: result.docs[0].id,
    })
  } catch (err) {
    // Log but don't throw — the parent document (team/player) is
    // already deleted. A failure here shouldn't break the operation.
    console.error('[deleteMediaByUrl] Failed to clean up media:', url, err)
  }
}
