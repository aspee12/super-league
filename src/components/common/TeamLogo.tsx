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
      <img
        src={logo}
        alt={name}
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
