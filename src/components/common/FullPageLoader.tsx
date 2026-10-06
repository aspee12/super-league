/**
 * Match-day loading screen.
 *
 * A ball is dropped onto the turf under the floodlights: it bounces, spins,
 * squashes where it lands, and drags a shadow that tightens with the height.
 * Keyframes live in `globals.css` under "Match-day loader" — including the
 * reduced-motion rules that freeze the scene.
 */

/** Panel geometry: a centre pentagon plus five pointing outward, clipped to
 *  the sphere so the edge panels fall away the way a real ball's do. */
const PANELS = [
  '50.0,31.0 68.1,44.1 61.2,65.4 38.8,65.4 31.9,44.1',
  '60.0,-3.8 66.2,15.3 50.0,27.0 33.8,15.3 40.0,-3.8',
  '104.2,42.9 88.0,54.6 71.9,42.9 78.0,23.9 98.0,23.9',
  '73.5,99.4 57.3,87.6 63.5,68.6 83.5,68.6 89.7,87.6',
  '10.3,87.6 16.5,68.6 36.5,68.6 42.7,87.6 26.5,99.4',
  '2.0,23.9 22.0,23.9 28.1,42.9 12.0,54.6 -4.2,42.9',
]

function Ball() {
  return (
    <div className="relative h-16 w-16">
      {/* Panels are the only layer that turns. */}
      <svg
        viewBox="0 0 100 100"
        className="animate-ssl-spin absolute inset-0 h-full w-full rounded-full bg-white"
        aria-hidden
      >
        <defs>
          <clipPath id="ssl-ball-clip">
            <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>
        <g clipPath="url(#ssl-ball-clip)">
          {PANELS.map((points) => (
            <polygon key={points} points={points} fill="#0b3d4c" />
          ))}
        </g>
      </svg>

      {/* Fixed shading on top: a lit upper-left and a dark lower-right edge are
          what make the spinning disc below read as a sphere. */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.25) 26%, rgba(255,255,255,0) 48%), radial-gradient(circle at 72% 78%, rgba(0,32,42,0.45) 0%, rgba(0,32,42,0.12) 38%, rgba(0,0,0,0) 62%)',
          boxShadow: 'inset 0 -6px 12px rgba(0,40,52,0.35), inset 0 4px 10px rgba(255,255,255,0.3)',
        }}
        aria-hidden
      />
    </div>
  )
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      // Flat tint rather than `backdrop-blur`: blurring the full viewport
      // every frame is the heaviest thing on screen during a route change.
      style={{ backgroundColor: 'rgba(0, 45, 56, 0.55)' }}
    >
      <div className="relative overflow-hidden rounded-3xl bg-white px-12 pt-10 pb-8 shadow-2xl">
        {/* Floodlight wash behind the ball. */}
        <div
          className="animate-ssl-floodlight pointer-events-none absolute left-1/2 top-0 h-40 w-56 -translate-x-1/2"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(166,223,230,0.9) 0%, rgba(236,249,255,0.5) 45%, rgba(255,255,255,0) 72%)',
          }}
          aria-hidden
        />

        <div className="relative flex flex-col items-center">
          {/* Fixed height so the card never jitters as the ball travels. */}
          <div className="relative flex h-[104px] w-[104px] items-end justify-center">
            <div
              className="animate-ssl-bounce absolute bottom-[14px]">
              <div
                className="animate-ssl-squash origin-bottom">
                <Ball />
              </div>
            </div>

            <div
              className="animate-ssl-shadow absolute bottom-[6px] h-[8px] w-14 rounded-[50%] bg-[#004556]"
              aria-hidden
            />
          </div>

          {/* Pitch line the ball lands on, fading out at both ends. */}
          <div
            className="mt-1 h-px w-32"
            style={{
              background:
                'linear-gradient(90deg, rgba(166,223,230,0) 0%, rgba(38,124,147,0.55) 50%, rgba(166,223,230,0) 100%)',
            }}
            aria-hidden
          />

          <p className="mt-5 flex items-center gap-1 text-[15px] font-semibold text-[#004556]">
            {message}
            <span className="flex items-end gap-[3px] pb-[3px]" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="animate-ssl-dot h-[3px] w-[3px] rounded-full bg-[#267c93]"
                  // Stagger only; the animation itself comes from the utility.
                  style={{ animationDelay: `${i * 0.16}s` }}
                />
              ))}
            </span>
          </p>

          {/* Indeterminate sweep: progress is unknowable here, so the bar
              reports motion rather than a percentage it would have to invent. */}
          <div className="mt-4 h-[3px] w-40 overflow-hidden rounded-full bg-[#ecf9ff]">
            <div
              className="animate-ssl-sweep h-full w-1/3 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #a6dfe6 0%, #267c93 50%, #a6dfe6 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
