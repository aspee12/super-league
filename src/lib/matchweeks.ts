import type { Match } from '@app-types/matchTypes'

export interface Matchweek {
  /**
   * Position among every matchday in the season, 1-indexed and counting the
   * rounds already played. This is what the fixture pager captions.
   */
  number: number
  /** 'YYYY-MM-DD' — the day the round is played on. */
  date: string
  matches: Match[]
}

/**
 * Group a season's fixtures into numbered matchweeks, one per matchday.
 *
 * The matchweek number has to be derived from *every* fixture in the season,
 * not just the ones still to be played. Numbering a filtered list restarts at
 * one the moment a round finishes, so the day after matchweek 1 is played its
 * successor is captioned "Matchweek 1" again.
 *
 * Rounds are keyed by date rather than sliced off in fixed-size pages. A page
 * size assumes every round has the same number of fixtures, which breaks on any
 * week with a bye or a rearranged tie — the numbering would silently drift for
 * the rest of the season.
 *
 * `matches` is expected to be a single season's fixtures; `useMatches` is
 * already season-scoped, so the count restarts each campaign as it should.
 */
export function buildMatchweeks(matches: readonly Match[]): Matchweek[] {
  const byDate = new Map<string, Match[]>()

  for (const match of matches) {
    if (!match.date) continue
    const bucket = byDate.get(match.date)
    if (bucket) bucket.push(match)
    else byDate.set(match.date, [match])
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayMatches], index) => ({
      number: index + 1,
      date,
      // Earliest kick-off first, so a round reads in the order it is played.
      matches: [...dayMatches].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? '')),
    }))
}

/**
 * The rounds that still have a fixture to be played, each keeping the number it
 * holds in the full season. Rounds already completed drop out, so the pager
 * opens on the next one to be played rather than on the start of the season.
 */
export function upcomingMatchweeks(matches: readonly Match[]): Matchweek[] {
  return buildMatchweeks(matches)
    .map((week) => ({
      ...week,
      matches: week.matches.filter((match) => match.status === 'upcoming'),
    }))
    .filter((week) => week.matches.length > 0)
}
