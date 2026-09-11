import sharp from 'sharp'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig, type Plugin } from 'payload'
import { Users } from './src/collections/Users'
import { Teams } from './src/collections/Teams'
import { Matches } from './src/collections/Matches'
import { Players } from './src/collections/Players'
import { Media } from './src/collections/Media'
import { News } from './src/collections/News'
import { Seasons } from './src/collections/Seasons'
import { BudgetEntries } from './src/collections/BudgetEntries'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

// Only use Vercel Blob storage when the token is available (production / Vercel).
// Locally, Payload falls back to its built-in local file storage (./media).
const plugins: Plugin[] = []
if (process.env.BLOB_READ_WRITE_TOKEN) {
  plugins.push(
    vercelBlobStorage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  )
}

export default buildConfig({
  collections: [Users, Teams, Matches, Players, Media, News, Seasons, BudgetEntries],
  secret: process.env.PAYLOAD_SECRET || '',
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  plugins,
  sharp,
})