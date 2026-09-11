/**
 * The "GK" chip shown next to a goalkeeper's name.
 *
 * Lives here so every surface that lists players — the Teams roster, the score
 * modals, the stats leaderboards and the match cards — marks keepers the same
 * way. `size="sm"` is for the denser mobile lists.
 */
export function GoalkeeperBadge({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      title="Goalkeeper"
      className={`shrink-0 font-semibold bg-green-100 text-green-700 rounded ${
        size === 'sm' ? 'text-[9px] px-1 py-0.5' : 'text-[10px] px-1.5 py-0.5'
      }`}
    >
      GK
    </span>
  )
}
