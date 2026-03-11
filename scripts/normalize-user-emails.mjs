/**
 * Lowercases all user emails so admin login works (login looks up by lowercase email).
 * Run if you get "email or password incorrect" with correct credentials.
 *
 * Usage: npm run normalize:user-emails
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

async function run() {
  const client = new MongoClient(DATABASE_URL)
  try {
    await client.connect()
    const db = client.db()
    const users = db.collection('users')
    const cursor = users.find({}, { projection: { _id: 1, email: 1 } })
    let count = 0
    for await (const doc of cursor) {
      if (doc.email && doc.email !== doc.email.toLowerCase()) {
        await users.updateOne(
          { _id: doc._id },
          { $set: { email: doc.email.toLowerCase().trim(), updatedAt: new Date() } }
        )
        console.log('Normalized:', doc.email, '->', doc.email.toLowerCase())
        count++
      }
    }
    console.log(count ? `Done. Normalized ${count} user(s).` : 'All emails already lowercase.')
  } finally {
    await client.close()
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
