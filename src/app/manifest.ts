import type { MetadataRoute } from 'next'

/**
 * Served at /manifest.webmanifest.
 *
 * This is what makes the portal installable: Chrome on Android offers a real
 * "Install app" (a WebAPK with its own icon and window) once a manifest with
 * icons is present over HTTPS — a service worker is no longer part of the
 * criteria. iOS has no install prompt at all, but Safari's Share → Add to
 * Home Screen uses these values for the app name and launch behaviour.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Selise Super League',
    short_name: 'Super League',
    description: 'Fixtures, results, standings and stats for the Selise Super League.',
    // `/` only redirects to /table, so launching there would cost every cold
    // start an extra navigation.
    start_url: '/table',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    // Tints the Android status bar; matches the white header so the chrome
    // and the app read as one surface.
    theme_color: '#ffffff',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Android masks adaptive icons to a circle and crops the edges, so it
      // needs a separate padded variant or the crest loses its border.
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    // Long-press the installed icon on Android to jump straight to a section.
    shortcuts: [
      { name: 'League Table', url: '/table' },
      { name: 'Matches', url: '/matches' },
      { name: 'Stats', url: '/stats' },
    ],
  }
}
