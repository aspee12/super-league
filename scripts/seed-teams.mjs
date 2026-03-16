/**
 * Seeds the Payload "teams" collection with dummy teams so that Add Match
 * can create matches with valid team relationships. Run this once so the
 * Teams collection has documents; the Add Match modal loads teams from the
 * API and uses their IDs when creating a match.
 *
 * Usage: npm run seed:teams  (or node scripts/seed-teams.mjs)
 * Requires: DATABASE_URL in .env
 */

import { MongoClient } from 'mongodb'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
require('dotenv').config()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env')
  process.exit(1)
}

const DUMMY_TEAMS = [
  { name: 'Single Aunty', logo: '🏆' },
  { name: 'Aunti Jaram', logo: '🛡️' },
  { name: 'Double Trouble', logo: '⚔️' },
  { name: 'Bros United', logo: '🎯' },
  { name: 'Red Dragon', logo: '🐉' },
  { name: 'Mini Lions', logo: '🦁' },
  { name: 'Aunty jaram', logo: '⭐' },
  { name: 'Uncles', logo: '🎪' },
  { name: 'Blue kak', logo: '🔵' },
  { name: 'Green tea', logo: '🍵' },
  { name: 'Red apple', logo: '🍎' },
]

async function seed() {
  const client = new MongoClient(DATABASE_URL)
  try {
    await client.connect()
    const db = client.db()
    const teams = db.collection('teams')
    const now = new Date()

    for (const t of DUMMY_TEAMS) {
      const doc = {
        name: t.name,
        logo: t.logo ?? '🏆',
        createdAt: now,
        updatedAt: now,
      }
      await teams.updateOne(
        { name: t.name },
        { $setOnInsert: doc },
        { upsert: true }
      )
    }
    console.log('Seeded', DUMMY_TEAMS.length, 'teams. Open Add Match to use them.')
  } finally {
    await client.close()
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
