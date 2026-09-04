/**
 * Seeds the Seasons collection and backfills existing matches.
 *
 * Ordering matters. `Matches.season` is required and every existing match
 * predates the field, so creating a season WITHOUT backfilling would make the
 * season filter exclude all of them — the league table, matches list and stats
 * would all render empty.
 *
 * This script therefore:
 *   1. creates Season 2 (the campaign the existing fixtures belong to)
 *   2. assigns every season-less match to Season 2
 *   3. creates Season 3 and makes it the active season
 *
 * It is idempotent — re-running it will not duplicate seasons or reassign
 * matches that already have one.
 *
 * Usage (dry run — reports what WOULD change, writes nothing):
 *   DATABASE_URL="<production-connection-string>" node scripts/seed-seasons.mjs
 *
 * Usage (apply):
 *   DATABASE_URL="<production-connection-string>" node scripts/seed-seasons.mjs --apply
 */

import { MongoClient } from 'mongodb'
import { createRequire } from 'node:module'

// Falls back to .env when DATABASE_URL isn't already in the environment,
// matching the other scripts in this folder.
if (!process.env.DATABASE_URL) {
  createRequire(import.meta.url)('dotenv').config()
}

const APPLY = process.argv.includes('--apply')
const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL.\n')
  console.error('  DATABASE_URL="mongodb+srv://..." node scripts/seed-seasons.mjs')
  process.exit(1)
}

if (/localhost|127\.0\.0\.1/.test(DATABASE_URL)) {
  console.warn('WARNING: DATABASE_URL points at localhost, not production.\n')
}

const SEASON_2 = {
  name: 'Season 2',
  order: 2,
  startDate: '2026-04-03',
  endDate: '2026-06-12',
  isActive: false,
}

const SEASON_3 = {
  name: 'Season 3',
  order: 3,
  startDate: '2026-09-11',
  endDate: '',
  isActive: true,
}

const client = new MongoClient(DATABASE_URL)

try {
  await client.connect()
  const db = client.db()
  const seasons = db.collection('seasons')
  const matches = db.collection('matches')
  const news = db.collection('news')
  const now = new Date()

  console.log(APPLY ? '=== APPLYING ===\n' : '=== DRY RUN (nothing will be written) ===\n')

  // --- Before -------------------------------------------------------------
  const beforeSeasons = await seasons.countDocuments()
  const totalMatches = await matches.countDocuments()
  const orphanMatches = await matches.countDocuments({
    $or: [{ season: { $exists: false } }, { season: null }],
  })
  const orphanNews = await news.countDocuments({
    $or: [{ season: { $exists: false } }, { season: null }],
  })

  console.log('Before:')
  console.log(`  seasons                : ${beforeSeasons}`)
  console.log(`  matches                : ${totalMatches}`)
  console.log(`  matches without season : ${orphanMatches}`)
  console.log(`  news without season    : ${orphanNews}\n`)

  // --- 1. Season 2 --------------------------------------------------------
  let s2 = await seasons.findOne({ name: SEASON_2.name })
  if (s2) {
    console.log(`1. "${SEASON_2.name}" already exists — reusing it`)
  } else if (APPLY) {
    const r = await seasons.insertOne({ ...SEASON_2, createdAt: now, updatedAt: now })
    s2 = { _id: r.insertedId, ...SEASON_2 }
    console.log(`1. created "${SEASON_2.name}"`)
  } else {
    console.log(`1. would create "${SEASON_2.name}" (order ${SEASON_2.order})`)
  }

  // --- 2. Backfill --------------------------------------------------------
  if (orphanMatches === 0) {
    console.log('2. no season-less matches — nothing to backfill')
  } else if (APPLY) {
    if (!s2?._id) throw new Error('Season 2 missing; cannot backfill')
    const r = await matches.updateMany(
      { $or: [{ season: { $exists: false } }, { season: null }] },
      { $set: { season: s2._id, updatedAt: now } },
    )
    console.log(`2. assigned ${r.modifiedCount} match(es) to "${SEASON_2.name}"`)
  } else {
    console.log(`2. would assign ${orphanMatches} match(es) to "${SEASON_2.name}"`)
  }

  // --- 3. Season 3, active ------------------------------------------------
  let s3 = await seasons.findOne({ name: SEASON_3.name })
  if (s3) {
    console.log(`3. "${SEASON_3.name}" already exists — reusing it`)
  } else if (APPLY) {
    const r = await seasons.insertOne({ ...SEASON_3, createdAt: now, updatedAt: now })
    s3 = { _id: r.insertedId, ...SEASON_3 }
    console.log(`3. created "${SEASON_3.name}"`)
  } else {
    console.log(`3. would create "${SEASON_3.name}" (order ${SEASON_3.order}, active)`)
  }

  // Exactly one active season. Written directly, so the collection's
  // afterChange hook does not run — enforce the invariant here instead.
  if (APPLY && s3?._id) {
    await seasons.updateMany({ _id: { $ne: s3._id } }, { $set: { isActive: false, updatedAt: now } })
    await seasons.updateOne({ _id: s3._id }, { $set: { isActive: true, updatedAt: now } })
    console.log(`   "${SEASON_3.name}" set active; all others cleared`)
  } else if (!APPLY) {
    console.log(`   would set "${SEASON_3.name}" active and clear any others`)
  }

  // --- After --------------------------------------------------------------
  if (APPLY) {
    console.log('\nAfter:')
    for (const s of await seasons.find({}).sort({ order: -1 }).toArray()) {
      const n = await matches.countDocuments({ season: s._id })
      console.log(`  ${s.name}${s.isActive ? ' [ACTIVE]' : ''} — ${n} match(es)`)
    }
    const stillOrphan = await matches.countDocuments({
      $or: [{ season: { $exists: false } }, { season: null }],
    })
    console.log(`  matches still without a season: ${stillOrphan}`)
    if (stillOrphan > 0) console.log('  WARNING: those will be hidden by the season filter.')
    if (orphanNews > 0) {
      console.log(`  NOTE: ${orphanNews} news article(s) have no season and will be hidden too.`)
    }
    console.log('\nDone.')
  } else {
    console.log('\nRe-run with --apply to make these changes.')
  }
} catch (err) {
  console.error('\nFailed:', err.message)
  process.exitCode = 1
} finally {
  await client.close()
}
