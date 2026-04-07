import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { deleteMediaByUrl } from '../lib/delete-media'

/**
 * When a player is deleted, delete their avatar from the Media collection
 * (which in turn triggers blob cleanup via Media's afterDelete hook).
 */
const cleanupPlayerAvatar: CollectionAfterDeleteHook = async ({ doc, req }) => {
  if (doc.avatar) {
    await deleteMediaByUrl(req.payload, doc.avatar)
  }
}

/**
 * When a player's name changes, update all match records that reference the old name
 * in playerStats.playerName or playerStats.assistName.
 */
const syncPlayerNameInMatches: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update') return doc
  if (!previousDoc || previousDoc.name === doc.name) return doc

  const oldName = previousDoc.name as string
  const newName = doc.name as string

  const { docs: matches } = await req.payload.find({
    collection: 'matches',
    limit: 0,
    where: {
      or: [
        { 'playerStats.playerName': { equals: oldName } },
        { 'playerStats.assistName': { equals: oldName } },
      ],
    },
  })

  await Promise.all(
    matches.map((match) => {
      const updatedStats = (match.playerStats ?? []).map((ps) => {
        const stat = ps as { playerName: string; assistName?: string | null; [key: string]: unknown }
        return {
          ...stat,
          playerName: stat.playerName === oldName ? newName : stat.playerName,
          assistName: stat.assistName === oldName ? newName : stat.assistName,
        }
      })
      return req.payload.update({
        collection: 'matches',
        id: match.id,
        data: { playerStats: updatedStats },
      })
    }),
  )

  return doc
}

export const Players: CollectionConfig = {
  slug: 'players',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'team', 'updatedAt'],
  },
  hooks: {
    afterChange: [syncPlayerNameInMatches],
    afterDelete: [cleanupPlayerAvatar],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      return user.permissions?.canAddTeam === true
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      return user.permissions?.canAddTeam === true
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'super_admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'avatar',
      type: 'text',
      required: false,
      defaultValue: '',
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'teams',
      required: true,
      hasMany: false,
    },
  ],
}
