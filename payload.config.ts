import sharp from 'sharp'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Users } from './src/collections/Users'
import { Teams } from './src/collections/Teams'
import { Matches } from './src/collections/Matches'
import { Players } from './src/collections/Players'
import { Media } from './src/collections/Media'

export default buildConfig({
  collections: [Users, Teams, Matches, Players, Media],
  secret: process.env.PAYLOAD_SECRET || '',
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})