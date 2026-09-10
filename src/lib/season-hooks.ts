import type { CollectionBeforeChangeHook, PayloadRequest } from 'payload'

/** The season currently flagged active, or undefined if none is. */
async function findActiveSeasonId(req: PayloadRequest): Promise<string | undefined> {
  const res = await req.payload.find({
    collection: 'seasons',
    where: { isActive: { equals: true } },
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })
  const id = res.docs[0]?.id
  return id ? String(id) : undefined
}

/**
 * Default a player's missing `season` to the active one.
 *
 * Squads are recorded one document per player *per season*, which is what keeps
 * a transfer from rewriting history. A record created without a season — from
 * the Payload admin panel, or an older client — would belong to no season and
 * vanish from every view, so fill it in rather than let that happen.
 */
export const defaultPlayerSeason: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== 'create' || data.season) return data
  const season = await findActiveSeasonId(req)
  return season ? { ...data, season } : data
}

/**
 * Default a team's missing `seasons` to the active one.
 *
 * A club with no seasons listed is in no competition at all, so it would drop
 * out of the table, the fixture list and the squad page at once.
 */
export const defaultTeamSeasons: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  if (operation !== 'create') return data
  if (Array.isArray(data.seasons) && data.seasons.length > 0) return data
  const season = await findActiveSeasonId(req)
  return season ? { ...data, seasons: [season] } : data
}
