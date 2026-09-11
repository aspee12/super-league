/**
 * Generates the PWA / home-screen icon set from a single source image.
 *
 * Usage: node scripts/generate-app-icons.mjs [source.png]
 * Default source: public/assets/ssl-logo.png
 *
 * Re-run this if the crest changes. The outputs are committed, so the app does
 * not depend on sharp at build time.
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const SOURCE = process.argv[2] ?? path.join(ROOT, 'public/assets/ssl-logo.png')
const ICONS_DIR = path.join(ROOT, 'public/icons')

// iOS composites home-screen icons onto black, so any transparency in the
// source turns into black corners. Every icon here is flattened onto white to
// match the app's header instead.
const BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 }

async function square(size, out) {
  await sharp(SOURCE)
    .resize(size, size, { fit: 'contain', background: BACKGROUND })
    .flatten({ background: BACKGROUND })
    .png()
    .toFile(out)
  console.log('wrote', path.relative(ROOT, out), `${size}x${size}`)
}

/**
 * Android masks adaptive icons to a circle/squircle and can crop up to 20% off
 * each edge, so a maskable icon has to sit inside a 80% "safe zone" or the
 * crest loses its edges.
 */
async function maskable(size, out) {
  const safe = Math.round(size * 0.8)
  const pad = Math.round((size - safe) / 2)
  const logo = await sharp(SOURCE)
    .resize(safe, safe, { fit: 'contain', background: BACKGROUND })
    .flatten({ background: BACKGROUND })
    .png()
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: BACKGROUND },
  })
    .composite([{ input: logo, top: pad, left: pad }])
    .png()
    .toFile(out)
  console.log('wrote', path.relative(ROOT, out), `${size}x${size} (maskable)`)
}

await mkdir(ICONS_DIR, { recursive: true })

await square(192, path.join(ICONS_DIR, 'icon-192.png'))
await square(512, path.join(ICONS_DIR, 'icon-512.png'))
await maskable(512, path.join(ICONS_DIR, 'icon-maskable-512.png'))

// Next.js serves `app/**/apple-icon.png` as <link rel="apple-touch-icon">.
// iOS wants 180x180 and applies its own rounded corners.
await square(180, path.join(ROOT, 'src/app/(client)/apple-icon.png'))

console.log('done')
