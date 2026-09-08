import type { PayloadRequest } from 'payload'

/**
 * Recover the stored `media.filename` from a URL held in a text field.
 *
 * The blob adapter builds URLs with `encodeURIComponent(filename)`, but Payload
 * stores the filename raw — `sanitize-filename` strips only illegal characters
 * and leaves spaces, `&`, `+` and non-ASCII alone. So a file picked as
 * "Team Logo.png" is stored as `Team Logo.png` but referenced as
 * `.../Team%20Logo.png`. Comparing the two directly never matches, which is
 * why image cleanup silently did nothing for most real-world uploads.
 */
function filenameCandidates(url: string): string[] {
  const raw = url.split('/').pop()
  if (!raw) return []

  // Strip any query string (blob URLs can carry one).
  const bare = raw.split('?')[0]

  const candidates = new Set<string>([bare])

  try {
    candidates.add(decodeURIComponent(bare))
  } catch {
    // Malformed escape sequence — the raw value is still worth trying.
  }

  // '+' is a legal literal in a filename but also a legacy space encoding.
  if (bare.includes('+')) candidates.add(bare.replace(/\+/g, ' '))

  return [...candidates]
}

/**
 * Find a Media document by its URL and delete it via Payload's API.
 * Deleting through Payload (not directly from the DB) ensures that
 * the Media collection's afterDelete hook fires, which handles
 * removing the actual file from Vercel Blob storage.
 *
 * Used by Teams, Players and News hooks to clean up orphaned images.
 */
export async function deleteMediaByUrl(
  req: PayloadRequest,
  url: string,
): Promise<void> {
  const { payload } = req

  try {
    const candidates = filenameCandidates(url)
    if (candidates.length === 0) return

    // Match on the URL as stored, or on any plausible decoding of the
    // filename. One query covers every variant.
    // Pass `req` so this joins the caller's transaction — if the parent
    // delete rolls back, the image must not already be gone.
    const result = await payload.find({
      collection: 'media',
      where: {
        or: [
          { url: { equals: url } },
          { filename: { in: candidates } },
        ],
      },
      limit: 1,
      depth: 0,
      req,
    })

    if (result.docs.length === 0) {
      // Surface the miss — a silent return here is what hid this bug.
      payload.logger.warn(
        `[deleteMediaByUrl] No media doc matched "${url}" (tried filenames: ${candidates.join(', ')}). Blob may be orphaned.`,
      )
      return
    }

    // Delete via Payload API — this triggers the afterDelete hook
    // on Media, which removes the file from Vercel Blob storage.
    await payload.delete({
      collection: 'media',
      id: result.docs[0].id,
      req,
    })
  } catch (err) {
    // Log but don't throw — the parent document (team/player/news) is
    // already deleted. A failure here shouldn't break the operation.
    payload.logger.error(
      { err },
      `[deleteMediaByUrl] Failed to clean up media: ${url}`,
    )
  }
}
