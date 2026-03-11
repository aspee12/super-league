/**
 * Promotes the first user (by createdAt) to super_admin with canAddTeam.
 * Run after creating at least one user via Payload Admin (/admin).
 *
 * Usage: npm run seed:super-admin
 * Requires: DATABASE_URL in .env (and dotenv loads .env from project root)
 */

import { createRequire } from 'node:module'
import { MongoClient } from 'mongodb'

const require = createRequire(import.meta.url)
require('dotenv').config()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env')
  process.exit(1)
}

async function seed() {
  const client = new MongoClient(DATABASE_URL)
  try {
    await client.connect()
    const db = client.db()
    // Payload mongoose adapter uses collection name from slug (e.g. "users")
    const users = db.collection('users')
    const first = await users.findOne(
      {},
      { sort: { createdAt: 1 }, projection: { email: 1, role: 1 } }
    )
    if (!first) {
      console.error('No users found. Create a user first at /admin')
      process.exit(1)
    }
    const result = await users.updateOne(
      { _id: first._id },
      {
        $set: {
          role: 'super_admin',
          'permissions.canAddTeam': true,
          updatedAt: new Date(),
        },
      }
    )
    if (result.modifiedCount === 0) {
      console.log('User already super_admin:', first.email)
    } else {
      console.log('Updated to super_admin:', first.email)
    }
  } finally {
    await client.close()
  }
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
