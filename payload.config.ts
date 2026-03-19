import sharp from 'sharp'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import { Users } from './src/collections/Users'
import { Teams } from './src/collections/Teams'
import { Matches } from './src/collections/Matches'
import { Players } from './src/collections/Players'
import { Media } from './src/collections/Media'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

export default buildConfig({
  collections: [Users, Teams, Matches, Players, Media],

  // Your Payload secret - should be a complex and secure string, unguessable
  secret: process.env.PAYLOAD_SECRET || '',
  // Whichever Database Adapter you're using should go here
  // Mongoose is shown as an example, but you can also use Postgres
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  plugins: [
    vercelBlobStorage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    }),
  ],
  // If you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // This is optional - if you don't need to do these things,
  // you don't need it!
  sharp,
})