import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import { deleteMediaByUrl } from './delete-media'

/**
 * Teams/Players/News store their image as a plain text URL pointing at a
 * separately-uploaded `media` document. Nothing links the two, so the parent
 * collections have to clean up after themselves — these hooks do that.
 */

/**
 * Delete the image when its parent record is deleted.
 *
 * @param field the text field holding the media URL (e.g. 'logo', 'avatar')
 */
export function cleanupMediaOnDelete(field: string): CollectionAfterDeleteHook {
  return async ({ doc, req }) => {
    const url = doc?.[field]
    if (typeof url === 'string' && url) {
      await deleteMediaByUrl(req, url)
    }
  }
}

/**
 * Delete the *previous* image when a record's image is replaced or cleared.
 *
 * Without this, editing a photo uploaded a fresh media document (and a fresh
 * blob) while merely overwriting the text pointer — the old blob stayed in
 * storage forever, referenced by nothing. Re-editing one logo five times left
 * five orphaned images behind, which is how the store filled up.
 *
 * @param field the text field holding the media URL
 */
export function cleanupReplacedMedia(field: string): CollectionAfterChangeHook {
  return async ({ doc, previousDoc, req, operation }) => {
    if (operation !== 'update') return

    const before = previousDoc?.[field]
    const after = doc?.[field]

    // Only act when a real previous image was pointed away from. Covers both
    // replacement (before -> different after) and clearing (after === '').
    if (typeof before !== 'string' || !before) return
    if (before === after) return

    await deleteMediaByUrl(req, before)
  }
}

/**
 * Delete a team's players when the team itself is deleted.
 *
 * `Players.team` is a required relationship, so without this the players are
 * left pointing at a team that no longer exists — and because their own
 * afterDelete hook never fires, their avatar blobs become unreachable: no
 * record remains to find them by. A 20-player team leaked 20+ blobs per delete.
 *
 * Deleting through the Payload API (rather than the DB) is what makes each
 * player's own avatar-cleanup hook run.
 */
export const cascadeDeleteTeamPlayers: CollectionAfterDeleteHook = async ({
  id,
  req,
}) => {
  try {
    await req.payload.delete({
      collection: 'players',
      where: { team: { equals: id } },
      // The team's access check already authorised this cascade.
      overrideAccess: true,
      // Join the team-delete transaction so a rollback undoes this too.
      req,
    })
  } catch (err) {
    // The team is already gone; surface the problem without failing the request.
    req.payload.logger.error(
      { err },
      `[cascadeDeleteTeamPlayers] Failed to delete players for team ${id}`,
    )
  }
}
