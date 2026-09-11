/**
 * Records each club's opening Seltrum balance for a season.
 *
 * Earnings never need seeding — wins and goals are recomputed from the fixtures
 * on every page load (wins x 2000, goals x 300), so a corrected scoreline fixes
 * the wallet by itself. What cannot be derived is the money a club walked in
 * with, which is what this writes: one `carry_forward` entry per club.
 *
 * The figures below are the balances the league has been keeping by hand. They
 * are booked against Season 3, which has no finished fixtures yet, so the portal
 * opens showing exactly these numbers and every result from here on moves them
 * automatically.
 *
 * Safety. Club names are matched exactly (trimmed, case-insensitive) and nothing
 * is written if any name is unmatched or ambiguous — crediting the wrong club
 * real money is worse than the script refusing to run. Re-running is safe: a
 * club that already has a carry-forward for the season is left alone.
 *
 * Usage: node scripts/seed-budgets.mjs                    (dry run, writes nothing)
 *        node scripts/seed-budgets.mjs --apply            (writes)
 *        node scripts/seed-budgets.mjs --season "Season 3"
 * Requires: DATABASE_URL in .env
 */

import { MongoClient } from 'mongodb'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
require('dotenv').config()

const APPLY = process.argv.includes('--apply')

const seasonFlag = process.argv.indexOf('--season')
const SEASON_NAME = seasonFlag !== -1 ? process.argv[seasonFlag + 1] : null

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env')
  process.exit(1)
}

/**
 * Opening balances, carried into the season being seeded.
 *
 * Names must match the clubs in the database. They are compared trimmed and
 * case-insensitively, which is what lets "SUDO FC" match the stored "SUDO FC "
 * — that stored name has a trailing space and is worth cleaning up separately.
 */
const OPENING_BALANCES = [
  { team: 'SUDO FC', amount: 4050 },
  { team: 'FC REDEMPTION', amount: 3900 },
  { team: 'ACE FC', amount: 4800 },
  { team: 'MINI LIONS FC', amount: 12699 },
  { team: 'JAGGLE FC', amount: 14300 },
]

const norm = (value) => String(value ?? '').trim().toLowerCase()
const money = (value) => value.toLocaleString('en-US')

/**
 * Payload writes this collection under its slug. Resolve it from the database
 * rather than assuming how the adapter spells a hyphenated slug, falling back
 * to the slug itself when nothing has been written yet.
 */
async function resolveLedgerCollection(db) {
  const names = (await db.listCollections().toArray()).map((c) => c.name)
  const match = names.find((name) => norm(name).replace(/[-_]/g, '') === 'budgetentries')
  return db.collection(match ?? 'budget-entries')
}

async function run() {
  const client = new MongoClient(DATABASE_URL)
  try {
    await client.connect()
    const db = client.db()
    const ledger = await resolveLedgerCollection(db)

    // --- season ---------------------------------------------------------
    const season = SEASON_NAME
      ? await db.collection('seasons').findOne({ name: SEASON_NAME })
      : await db.collection('seasons').findOne({ isActive: true })

    if (!season) {
      console.error(
        SEASON_NAME
          ? `No season named "${SEASON_NAME}".`
          : 'No active season. Flag one active, or pass --season "Season 3".',
      )
      process.exit(1)
    }
    console.log(`Season: ${season.name}\n`)

    // --- resolve every club name up front, and refuse to guess -----------
    const teams = await db.collection('teams').find({}).toArray()
    const byName = new Map()
    for (const team of teams) {
      const key = norm(team.name)
      if (byName.has(key)) byName.set(key, 'AMBIGUOUS')
      else byName.set(key, team)
    }

    const unmatched = []
    const ambiguous = []
    for (const row of OPENING_BALANCES) {
      const found = byName.get(norm(row.team))
      if (!found) unmatched.push(row.team)
      else if (found === 'AMBIGUOUS') ambiguous.push(row.team)
    }

    if (unmatched.length > 0 || ambiguous.length > 0) {
      if (unmatched.length > 0) {
        console.error('No club matches these names:')
        for (const name of unmatched) console.error(`  - ${name}`)
      }
      if (ambiguous.length > 0) {
        console.error('More than one club shares these names:')
        for (const name of ambiguous) console.error(`  - ${name}`)
      }
      console.error('\nClubs currently in the database:')
      for (const team of teams) console.error(`  - "${team.name}"`)
      console.error(
        '\nNothing was written. Fix the names in this script (or in the database) and re-run.',
      )
      process.exit(1)
    }

    // --- plan -------------------------------------------------------------
    const now = new Date()
    const planned = []

    for (const row of OPENING_BALANCES) {
      const team = byName.get(norm(row.team))
      const existing = await ledger.findOne({
        team: team._id,
        season: season._id,
        type: 'carry_forward',
      })

      if (existing) {
        console.log(
          `  = ${team.name.trim()}: carry-forward already recorded ` +
            `(${money(existing.amount ?? 0)}), skipping`,
        )
        continue
      }

      planned.push({
        team: team._id,
        season: season._id,
        type: 'carry_forward',
        amount: row.amount,
        description: 'Balance carried into the season',
        date: season.startDate || '',
        createdAt: now,
        updatedAt: now,
      })
      console.log(`  + ${team.name.trim()}: carry forward ${money(row.amount)}`)
    }

    // --- write -----------------------------------------------------------
    console.log('')
    if (planned.length === 0) {
      console.log('Nothing to do — every club already has an opening balance.')
      return
    }

    const total = planned.reduce((sum, entry) => sum + entry.amount, 0)

    if (!APPLY) {
      console.log(`Dry run: ${planned.length} entries totalling ${money(total)} would be written.`)
      console.log('Re-run with --apply to write them.')
      return
    }

    await ledger.insertMany(planned)
    console.log(
      `Wrote ${planned.length} entries totalling ${money(total)} into ${ledger.collectionName}.`,
    )
  } finally {
    await client.close()
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
