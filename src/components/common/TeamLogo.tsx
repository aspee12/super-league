import Image from 'next/image'

/** Renders a team logo - either as an image (URL) or emoji/text fallback */
export function TeamLogo({
  logo,
  name,
  className = "w-6 h-6",
  textClassName = "text-lg",
}: {
  logo: string
  name: string
  className?: string
  textClassName?: string
}) {
  const isUrl = logo.startsWith("/") || logo.startsWith("http")

  if (isUrl) {
    return (
      <Image
        src={logo}
        alt={name}
        // Crests are uploaded at full resolution — the Media collection stores
        // no derived sizes — so a raw <img> shipped the original (1 MB+) to
        // fill a 24px cell, once per row. These dimensions only tell the
        // optimiser what to generate; `className` still controls the rendered
        // size. 96px covers the largest on-screen use (48px) at 2x.
        width={96}
        height={96}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }

  return (
    <span className={textClassName} title={name}>
      {logo || name.charAt(0)}
    </span>
  )
}
