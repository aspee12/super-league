import type { CapacitorConfig } from '@capacitor/cli'

/**
 * The portal is server-rendered (Payload + MongoDB behind `/api/*`, and every
 * content route is dynamic), so there is nothing to export into the app
 * bundle. The WebView loads the hosted site instead, which also means content
 * ships with a web deploy rather than an app-store review.
 *
 * `www/` therefore holds only the offline fallback — see `server.errorPath`.
 *
 * Point the shell at a different origin for local work without editing this
 * file:
 *   CAP_SERVER_URL=http://192.168.1.10:3000 yarn sync
 * A LAN IP is required, not localhost — on a device or simulator `localhost`
 * resolves to the device itself.
 */
const PRODUCTION_URL = 'https://selise-super-league.vercel.app'

const serverUrl = process.env.CAP_SERVER_URL ?? PRODUCTION_URL

const config: CapacitorConfig = {
  appId: 'com.selisegroup.superleague',
  appName: 'Selise Super League',
  webDir: 'www',

  server: {
    url: serverUrl,
    // Android blocks cleartext by default from API 28. Only relax it when the
    // configured origin actually needs it, i.e. a local dev server over http.
    cleartext: serverUrl.startsWith('http://'),
    androidScheme: 'https',
    // Loaded when the origin above is unreachable, instead of the WebView's
    // stock "webpage not available" screen.
    errorPath: 'error.html',
    // Anything not matched here opens in the system browser (handled by the
    // link interception in CapacitorBridge), so the shell never navigates to
    // a third-party page it cannot get back from.
    allowNavigation: ['selise-super-league.vercel.app'],
  },

  ios: {
    // The web layout already reserves the home-indicator inset itself via
    // `env(safe-area-inset-bottom)`; letting the WebView add its own inset on
    // top would double it.
    contentInset: 'never',
  },

  android: {
    allowMixedContent: false,
  },

  plugins: {
    SplashScreen: {
      // CapacitorBridge in the web app hides this on first paint, which is
      // what normally ends the splash. The timer is the safety net: the shell
      // loads a remote site it does not control, so if an older build is
      // served, a deploy reverts the bridge, or the page fails outright, the
      // splash must still come down instead of stranding the app on it.
      launchAutoHide: true,
      launchShowDuration: 3000,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
}

export default config
