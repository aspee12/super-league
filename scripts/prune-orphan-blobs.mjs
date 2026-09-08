/**
 * Reclaims Vercel Blob storage taken up by images nothing references any more.
 *
 * The app stores images as plain URL text on teams.logo / players.avatar /
 * news.image, pointing at separately-uploaded `media` documents. Two historical
 * bugs leaked blobs: replacing an image never deleted the old one, and the
 * delete-time cleanup silently failed on any filename containing a space. Both
 * are fixed going forward — this script cleans up what they already left behind.
 *
 * It reports three categories:
 *   1. unreferenced media docs — a `media` doc no team/player/news points at
 *   2. stray blobs            — a blob with no `media` doc at all
 *   3. legacy size blobs      — `-400x300` / `-768xNNN` variants from the
 *                               removed `imageSizes` config, which no UI reads
 *
 * DRY RUN BY DEFAULT — prints what it would delete and changes nothing.
 * Re-run with --delete to actually remove them.
 *
 * Usage:
 *   node scripts/prune-orphan-blobs.mjs            # report only
 *   node scripts/prune-orphan-blobs.mjs --delete   # actually delete
 *
 * Requires DATABASE_URL and BLOB_READ_WRITE_TOKEN in .env
 */

import { MongoClient } from 'mongodb'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
require('dotenv').config()

const { DATABASE_URL, BLOB_READ_WRITE_TOKEN } = process.env
const APPLY = process.argv.includes('--delete')

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env')
  process.exit(1)
}
if (!BLOB_READ_WRITE_TOKEN) {
  console.error(
    'Missing BLOB_READ_WRITE_TOKEN in .env — copy it from the Vercel Blob store settings.',
  )
  process.exit(1)
}

/** Matches the `-800x600` suffix Payload appended for each generated imageSize. */
const SIZE_SUFFIX = /-\d+x\d+(\.[a-z0-9]+)$/i

/** Last path segment of a URL, decoded, query stripped. */
function filenameFromUrl(url) {
  if (typeof url !== 'string' || !url) return null
  const bare = url.split('/').pop()?.split('?')[0]
  if (!bare) return null
  try {
    return decodeURIComponent(bare)
  } catch {
    return bare
  }
}

async function main() {
  const { list, del } = await import('@vercel/blob')
  const client = new MongoClient(DATABASE_URL)

  try {
    await client.connect()
    const db = client.db()

    // --- 1. Every image URL the app actually references -------------------
    const referenced = new Set()
    const addRef = (url) => {
      const name = filenameFromUrl(url)
      if (name) referenced.add(name)
    }

    for (const [collection, field] of [
      ['teams', 'logo'],
      ['players', 'avatar'],
      ['news', 'image'],
    ]) {
      const docs = await db
        .collection(collection)
        .find({ [field]: { $nin: [null, ''] } }, { projection: { [field]: 1 } })
        .toArray()
      docs.forEach((d) => addRef(d[field]))
      console.log(`  ${collection}.${field}: ${docs.length} referencing docs`)
    }

    // --- 2. Media docs, and which are unreferenced ------------------------
    const mediaDocs = await db
      .collection('media')
      .find({}, { projection: { filename: 1, url: 1, sizes: 1 } })
      .toArray()

    const mediaByFilename = new Map()
    for (const m of mediaDocs) {
      if (m.filename) mediaByFilename.set(m.filename, m)
    }

    const unreferencedMedia = mediaDocs.filter(
      (m) => m.filename && !referenced.has(m.filename),
    )

    // --- 3. Everything currently in the blob store ------------------------
    const blobs = []
    let cursor
    do {
      const page = await list({ token: BLOB_READ_WRITE_TOKEN, cursor })
      blobs.push(...page.blobs)
      cursor = page.cursor
    } while (cursor)

    const legacySizeBlobs = []
    const strayBlobs = []

    for (const blob of blobs) {
      const name = filenameFromUrl(blob.url)
      if (!name) continue

      // Safety first: anything still referenced by a record, or still owned by
      // a media document, is live — never a deletion candidate. This check has
      // to come BEFORE the `-WxH` heuristic, because a user file can legitimately
      // be named "photo-1920x1080.jpg" and must not be mistaken for a leftover.
      if (referenced.has(name) || mediaByFilename.has(name)) continue

      // Unreferenced and shaped like a generated size → leftover imageSize.
      if (SIZE_SUFFIX.test(name)) {
        legacySizeBlobs.push(blob)
        continue
      }

      // Unreferenced with no media doc at all → stray (e.g. the record was
      // deleted while BLOB_READ_WRITE_TOKEN was absent, so `del` never ran).
      strayBlobs.push(blob)
    }

    const totalBytes = (arr) => arr.reduce((n, b) => n + (b.size || 0), 0)
    const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

    // --- Report -----------------------------------------------------------
    console.log(`\nBlob store:            ${blobs.length} objects, ${mb(totalBytes(blobs))}`)
    console.log(`Media documents:       ${mediaDocs.length}`)
    console.log(`Referenced filenames:  ${referenced.size}`)
    console.log(`\nReclaimable:`)
    console.log(
      `  legacy size blobs:   ${legacySizeBlobs.length} (${mb(totalBytes(legacySizeBlobs))}) — includes sizes belonging to live images; no UI reads them`,
    )
    console.log(`  stray blobs:         ${strayBlobs.length} (${mb(totalBytes(strayBlobs))})`)
    console.log(`  unreferenced media:  ${unreferencedMedia.length} docs`)

    const blobsToDelete = [...legacySizeBlobs, ...strayBlobs]

    if (blobsToDelete.length) {
      console.log('\nBlobs that would be deleted:')
      for (const b of blobsToDelete) {
        console.log(`  ${filenameFromUrl(b.url)}  (${mb(b.size || 0)})`)
      }
    }
    if (unreferencedMedia.length) {
      console.log('\nUnreferenced media docs that would be deleted:')
      for (const m of unreferencedMedia) console.log(`  ${m.filename}`)
    }

    if (!APPLY) {
      console.log(
        `\nDRY RUN — nothing was deleted. Would free ${mb(totalBytes(blobsToDelete))}.`,
      )
      console.log('Review the lists above, then re-run with --delete to apply.')
      return
    }

    // --- Apply ------------------------------------------------------------
    console.log('\nDeleting...')

    if (blobsToDelete.length) {
      // `del` accepts a batch of URLs.
      await del(
        blobsToDelete.map((b) => b.url),
        { token: BLOB_READ_WRITE_TOKEN },
      )
      console.log(`  removed ${blobsToDelete.length} blobs`)
    }

    if (unreferencedMedia.length) {
      // Also drop the blobs still owned by those docs (original + old sizes).
      const ownedUrls = unreferencedMedia.flatMap((m) => [
        m.url,
        ...Object.values(m.sizes || {}).map((s) => s?.url),
      ])
      const live = ownedUrls.filter(
        (u) => typeof u === 'string' && u.startsWith('http'),
      )
      if (live.length) {
        // Already-deleted URLs are ignored by `del`, so this is safe to repeat.
        await del(live, { token: BLOB_READ_WRITE_TOKEN })
      }

      await db
        .collection('media')
        .deleteMany({ _id: { $in: unreferencedMedia.map((m) => m._id) } })
      console.log(`  removed ${unreferencedMedia.length} media docs`)
    }

    console.log(`\nDone. Freed roughly ${mb(totalBytes(blobsToDelete))}.`)
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
