import type { MatchStatus } from '@app-types/matchTypes'

/**
 * Compute the display status of a match based on its stored status and scheduled time.
 *
 * Rules:
 * - If the stored status is 'finished', the match has been explicitly ended → "finished"
 * - If the match date/time is in the future → "upcoming"
 * - If the match date/time has passed (or is now) and not ended → "live"
 */
export function computeMatchStatus(
  storedStatus: MatchStatus,
  date: string,
  time: string,
): MatchStatus {
  if (storedStatus === 'finished') return 'finished'

  const matchDateTime = parseMatchDateTime(date, time)
  if (!matchDateTime) return storedStatus

  const now = new Date()

  if (matchDateTime > now) return 'upcoming'

  return 'live'
}

/**
 * Parse the match date (YYYY-MM-DD from input[type=date]) and time (HH:mm) into a Date.
 */
function parseMatchDateTime(date: string, time: string): Date | null {
  if (!date || !time) return null

  const dateTime = new Date(`${date}T${time}:00`)
  if (isNaN(dateTime.getTime())) return null

  return dateTime
}
