/**
 * Backfills the season fields introduced alongside per-season squads, and
 * rebuilds the squad records that the Season 3 transfers overwrote.
 *
 * Players used to hold a single `team` pointer, so transferring a player into
 * the new season rewrote where they had played the season before. The only
 * surviving evidence of a past squad is the match record: every goal and assist
 * names a player and the side they were playing for. This reconstructs past
 * seasons from that.
 *
 * What it does, all of it idempotent:
 *   1. teams.seasons   — every season the club has a fixture in, plus the
 *                        active season if the club currently has a squad.
 *   2. players.season  — existing records describe the active season's squads
 *                        (that is what the transfers left behind), so tag them
 *                        with it.
 *   3. past squads     — for each non-active season, recreate one player record
 *                        per name found in that season's playerStats, on the
 *                        club they were playing for. Avatar and goalkeeper flag
 *                        are carried over from the player's current record when
 *                        the name still exists.
 *
 * Players who never scored or assisted leave no trace in the match record and
 * cannot be recovered; they are listed at the end so they can be added by hand.
 *
 * Usage: node scripts/backfill-seasons.mjs            (dry run, writes nothing)
 *        node scripts/backfill-seasons.mjs --apply    (writes)
 * Requires: DATABASE_URL in .env
 */

import { MongoClient, ObjectId } from 'mongodb'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
require('dotenv').config()

const APPLY = process.argv.includes('--apply')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env')
  process.exit(1)
}

/** Names were typed by hand and some carry stray whitespace or casing. */
const key = (name) => String(name ?? '').trim().toLowerCase()
const id = (v) => String(v)

async function main() {
  const client = new MongoClient(DATABASE_URL)
  await client.connect()
  const db = client.db()

  const seasons = await db.collection('seasons').find({}).sort({ order: 1 }).toArray()
  const teams = await db.collection('teams').find({}).toArray()
  const players = await db.collection('players').find({}).toArray()
  const matches = await db.collection('matches').find({}).toArray()

  const activeSeason = seasons.find((s) => s.isActive)
  if (!activeSeason) {
    throw new Error('No season is flagged active — set one before running this.')
  }

  const teamName = new Map(teams.map((t) => [id(t._id), t.name]))
  const seasonName = new Map(seasons.map((s) => [id(s._id), s.name]))

  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN — no writes'}`)
  console.log(`Active season: ${activeSeason.name}`)
  console.log(`${seasons.length} seasons, ${teams.length} teams, ${players.length} players, ${matches.length} matches`)

  // ── 1. teams.seasons ──────────────────────────────────────────────────────
  // A club belongs to a season if it has a fixture there. Clubs with a current
  // squad also belong to the active season, which is the only way to place a
  // club that has joined but not yet played — Jaggle FC's exact situation.
  const teamSeasons = new Map(teams.map((t) => [id(t._id), new Set()]))
  for (const m of matches) {
    for (const side of [m.teamA, m.teamB]) {
      teamSeasons.get(id(side))?.add(id(m.season))
    }
  }
  for (const p of players) {
    if (teamSeasons.has(id(p.team))) teamSeasons.get(id(p.team)).add(id(activeSeason._id))
  }

  console.log('\n── teams.seasons ──')
  const teamOps = []
  for (const t of teams) {
    const want = [...teamSeasons.get(id(t._id))]
    const have = (t.seasons ?? []).map(id)
    const same = want.length === have.length && want.every((s) => have.includes(s))
    const label = want.map((s) => seasonName.get(s) ?? s).sort().join(', ') || '(none)'
    if (same) {
      console.log(`  = ${t.name}: ${label}`)
      continue
    }
    console.log(`  + ${t.name}: ${label}`)
    teamOps.push({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { seasons: want.map((s) => new ObjectId(s)), updatedAt: new Date().toISOString() } },
      },
    })
  }

  // ── 2. players.season on existing records ─────────────────────────────────
  console.log('\n── players.season (existing records) ──')
  const untagged = players.filter((p) => !p.season)
  console.log(`  ${untagged.length} of ${players.length} records need tagging with ${activeSeason.name}`)
  const playerOps = untagged.map((p) => ({
    updateOne: {
      filter: { _id: p._id },
      update: { $set: { season: new ObjectId(id(activeSeason._id)), updatedAt: new Date().toISOString() } },
    },
  }))

  // ── 3. rebuild past-season squads from the match record ───────────────────
  // Look up by name so a rebuilt record inherits the photo and goalkeeper flag
  // the player still has today.
  const currentByName = new Map()
  for (const p of players) currentByName.set(key(p.name), p)

  const inserts = []
  const unrecoverable = new Set(players.map((p) => key(p.name)))

  for (const season of seasons) {
    if (id(season._id) === id(activeSeason._id)) continue

    const seasonMatches = matches.filter((m) => id(m.season) === id(season._id))
    if (seasonMatches.length === 0) continue

    // name -> teamId -> number of stat rows, so a name appearing under two
    // clubs resolves to the one it appears under most rather than at random.
    const appearances = new Map()
    const displayName = new Map()
    for (const m of seasonMatches) {
      for (const ps of m.playerStats ?? []) {
        const teamId = id(ps.team === 'teamA' ? m.teamA : m.teamB)
        for (const raw of [ps.playerName, ps.assistName]) {
          if (!raw || !key(raw)) continue
          const k = key(raw)
          if (!appearances.has(k)) appearances.set(k, new Map())
          const counts = appearances.get(k)
          counts.set(teamId, (counts.get(teamId) ?? 0) + 1)
          if (!displayName.has(k)) displayName.set(k, String(raw).trim())
        }
      }
    }

    const existing = new Set(
      players.filter((p) => id(p.season) === id(season._id)).map((p) => key(p.name)),
    )

    console.log(`\n── ${season.name}: rebuilding squads from ${seasonMatches.length} matches ──`)
    const bySquad = new Map()

    for (const [k, counts] of appearances) {
      unrecoverable.delete(k)
      const ranked = [...counts].sort((a, b) => b[1] - a[1])
      const [teamId, top] = ranked[0]
      if (ranked.length > 1) {
        console.log(
          `  ! ${displayName.get(k)} appears for ${ranked.length} clubs ` +
            `(${ranked.map(([t, n]) => `${teamName.get(t)}×${n}`).join(', ')}) — placing at ${teamName.get(teamId)}`,
        )
      }
      if (existing.has(k)) continue

      const current = currentByName.get(k)
      const name = current?.name ?? displayName.get(k)
      if (!bySquad.has(teamId)) bySquad.set(teamId, [])
      bySquad.get(teamId).push(current ? name : `${name} (record lost — rebuilt)`)

      inserts.push({
        name,
        avatar: current?.avatar ?? '',
        isGoalkeeper: current?.isGoalkeeper ?? false,
        team: new ObjectId(teamId),
        season: new ObjectId(id(season._id)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __v: 0,
      })
      void top
    }

    for (const [teamId, names] of bySquad) {
      console.log(`  ${teamName.get(teamId)} (${names.length}): ${names.join(', ')}`)
    }
    if (bySquad.size === 0) console.log('  nothing to add — already rebuilt')
  }

  if (unrecoverable.size > 0) {
    console.log('\n── not recoverable from the match record ──')
    console.log('  These players never scored or assisted in a past season, so there is')
    console.log('  no evidence of which club they were at. They exist only in the active')
    console.log('  season; add them to past seasons by hand if they played:')
    for (const k of unrecoverable) {
      const p = currentByName.get(k)
      console.log(`    ${p.name} — currently ${teamName.get(id(p.team)) ?? '?'}${p.isGoalkeeper ? ' (GK)' : ''}`)
    }
  }

  // ── summary / write ───────────────────────────────────────────────────────
  console.log('\n── summary ──')
  console.log(`  teams to update:      ${teamOps.length}`)
  console.log(`  players to tag:       ${playerOps.length}`)
  console.log(`  past-season records:  ${inserts.length}`)

  if (!APPLY) {
    console.log('\nDry run — nothing written. Re-run with --apply to commit.')
    await client.close()
    return
  }

  if (teamOps.length) await db.collection('teams').bulkWrite(teamOps)
  if (playerOps.length) await db.collection('players').bulkWrite(playerOps)
  if (inserts.length) await db.collection('players').insertMany(inserts)

  const remaining = await db.collection('players').countDocuments({ season: { $exists: false } })
  console.log(`\nDone. Players still without a season: ${remaining}`)
  await client.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
