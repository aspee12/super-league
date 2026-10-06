import type { PlayerStat } from '@app-types/matchTypes'

/** The two sides of a fixture, as stored on a player stat row. */
export type MatchSide = 'teamA' | 'teamB'

/** Shape shared by the stored and client-side stat rows. */
type StatRow = Pick<PlayerStat, 'team' | 'goals'> & { isOwnGoal?: boolean | null }

/**
 * Whether a stat row records an own goal.
 *
 * The flag only means anything alongside a goal — a card or an assist cannot be
 * "own". Requiring `goals > 0` stops a stray tick in the admin panel from
 * quietly moving a booking onto the other team's sheet.
 */
export function isOwnGoal(stat: StatRow): boolean {
  return stat.isOwnGoal === true && stat.goals > 0
}

/** The other side of the fixture. */
export function oppositeSide(side: MatchSide): MatchSide {
  return side === 'teamA' ? 'teamB' : 'teamA'
}

/**
 * The side the *named player* actually turns out for.
 *
 * `stat.team` is the side the goal is credited to, which drives the scoreline.
 * For an own goal the scorer plays for the other side, so anything that
 * identifies the person — leaderboard keys, squad lookups, the goalkeeper badge
 * — has to invert it. Anything that counts the goal itself must keep using
 * `stat.team`.
 */
export function playerSideOf(stat: StatRow): MatchSide {
  return isOwnGoal(stat) ? oppositeSide(stat.team) : stat.team
}

/**
 * Goals this row adds to the named player's personal tally.
 *
 * An own goal counts for the opposing team on the scoreboard but is never added
 * to anyone's scoring record — matching how Opta, FIFA and UEFA treat it.
 */
export function creditedGoals(stat: StatRow): number {
  return isOwnGoal(stat) ? 0 : stat.goals
}
