import type { Match, Team } from '@app-types/matchTypes'

export interface NextOpponent {
  logo: string
  name: string
}

export interface StandingEntry {
  team: Team
  position: number
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: Array<'W' | 'D' | 'L'>
  /** positive = moved up, negative = moved down, 0 = unchanged */
  positionChange: number
  nextOpponent?: NextOpponent
}

interface TeamAccumulator {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
  form: Array<'W' | 'D' | 'L'>
}

/**
 * Sort comparator matching PL rules:
 * 1. Points (desc)
 * 2. Goal difference (desc)
 * 3. Goals scored (desc)
 * 4. Team name (asc, tiebreaker)
 */
function standingSort(a: TeamAccumulator, b: TeamAccumulator): number {
  if (b.points !== a.points) return b.points - a.points
  const gdA = a.goalsFor - a.goalsAgainst
  const gdB = b.goalsFor - b.goalsAgainst
  if (gdB !== gdA) return gdB - gdA
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
  return a.team.name.localeCompare(b.team.name)
}

function buildAccumulators(
  finishedMatches: Match[],
  allTeams: Team[],
): Map<string, TeamAccumulator> {
  const map = new Map<string, TeamAccumulator>()

  // Initialize every team so teams with 0 matches still appear
  for (const team of allTeams) {
    map.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: [],
    })
  }

  for (const match of finishedMatches) {
    const a = map.get(match.teamA.id)
    const b = map.get(match.teamB.id)
    if (!a || !b) continue

    a.played++
    b.played++
    a.goalsFor += match.scoreA
    a.goalsAgainst += match.scoreB
    b.goalsFor += match.scoreB
    b.goalsAgainst += match.scoreA

    if (match.scoreA > match.scoreB) {
      a.won++
      a.points += 3
      b.lost++
      a.form.push('W')
      b.form.push('L')
    } else if (match.scoreA < match.scoreB) {
      b.won++
      b.points += 3
      a.lost++
      a.form.push('L')
      b.form.push('W')
    } else {
      a.drawn++
      b.drawn++
      a.points += 1
      b.points += 1
      a.form.push('D')
      b.form.push('D')
    }
  }

  return map
}

/**
 * Compute league standings from finished matches.
 * Position change is calculated by comparing the table with and without the
 * most recent match — simulating how a team moved after the latest result.
 */
export function computeStandings(
  allMatches: Match[],
  allTeams: Team[],
): StandingEntry[] {
  // Sort finished matches by date so form array is chronological
  const finished = allMatches
    .filter((m) => m.status === 'finished')
    .sort((a, b) => {
      const da = new Date(`${a.date}T${a.time}`)
      const db = new Date(`${b.date}T${b.time}`)
      return da.getTime() - db.getTime()
    })

  if (allTeams.length === 0) return []

  // Current standings
  const currentMap = buildAccumulators(finished, allTeams)
  const currentSorted = [...currentMap.values()].sort(standingSort)

  // Previous standings (without the last match) for position change
  const prevFinished = finished.slice(0, -1)
  const prevMap = buildAccumulators(prevFinished, allTeams)
  const prevSorted = [...prevMap.values()].sort(standingSort)

  // Build position lookup from previous standings
  const prevPositionMap = new Map<string, number>()
  prevSorted.forEach((entry, idx) => {
    prevPositionMap.set(entry.team.id, idx + 1)
  })

  return currentSorted.map((entry, idx) => {
    const position = idx + 1
    const prevPosition = prevPositionMap.get(entry.team.id) ?? position
    // positionChange > 0 means moved up, < 0 means moved down
    const positionChange = prevPosition - position

    return {
      team: entry.team,
      position,
      played: entry.played,
      won: entry.won,
      drawn: entry.drawn,
      lost: entry.lost,
      goalsFor: entry.goalsFor,
      goalsAgainst: entry.goalsAgainst,
      goalDifference: entry.goalsFor - entry.goalsAgainst,
      points: entry.points,
      form: entry.form.slice(-5), // Last 5 results
      positionChange,
    }
  })
}
