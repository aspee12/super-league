/** Convert 24h "HH:mm" to 12h display "h:mm AM/PM" */
export function formatTime12h(time24: string): string {
  if (!time24) return ''
  const [hStr, m] = time24.split(':')
  let h = parseInt(hStr, 10)
  if (isNaN(h)) return time24
  const period = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${m} ${period}`
}
