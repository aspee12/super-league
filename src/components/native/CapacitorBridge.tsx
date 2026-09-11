'use client'

import { useEffect } from 'react'

/**
 * Native shell integration for the Capacitor wrapper in `apps/mobile`.
 *
 * The wrapper points its WebView at the hosted site rather than bundling it
 * (the portal is server-rendered, so there is nothing to bundle), which means
 * this page *is* the app. Anything native — hiding the splash, the Android
 * back button, opening third-party links outside the shell — has to be driven
 * from here.
 *
 * Capacitor injects its bridge on `window`, so this talks to it through the
 * global instead of importing `@capacitor/*`. That keeps the plugin packages
 * out of the web bundle: in a normal browser `window.Capacitor` is undefined
 * and every effect below returns immediately.
 */

type PluginListenerHandle = { remove: () => Promise<void> }

type CapacitorGlobal = {
  isNativePlatform?: () => boolean
  getPlatform?: () => string
  Plugins?: {
    App?: {
      addListener: (
        event: 'backButton',
        fn: (state: { canGoBack: boolean }) => void,
      ) => Promise<PluginListenerHandle>
      exitApp: () => Promise<void>
    }
    Browser?: { open: (options: { url: string }) => Promise<void> }
    SplashScreen?: { hide: () => Promise<void> }
    StatusBar?: {
      setStyle: (options: { style: 'DARK' | 'LIGHT' }) => Promise<void>
      setBackgroundColor?: (options: { color: string }) => Promise<void>
    }
  }
}

declare global {
  interface Window {
    Capacitor?: CapacitorGlobal
  }
}

function nativePlugins(): NonNullable<CapacitorGlobal['Plugins']> | null {
  if (typeof window === 'undefined') return null
  const cap = window.Capacitor
  if (!cap?.isNativePlatform?.()) return null
  return cap.Plugins ?? null
}

export function CapacitorBridge() {
  // Splash + status bar: one-shot chrome setup on first paint.
  useEffect(() => {
    const plugins = nativePlugins()
    if (!plugins) return

    // `launchAutoHide` is false in capacitor.config.ts, so the splash covers
    // the WebView until React has actually rendered. Without this the app
    // would sit on the splash forever.
    void plugins.SplashScreen?.hide()

    // The header is white, so the status bar needs dark glyphs. "LIGHT" is
    // Capacitor's name for dark-text-on-light-background.
    void plugins.StatusBar?.setStyle({ style: 'LIGHT' })
    void plugins.StatusBar?.setBackgroundColor?.({ color: '#ffffff' })
  }, [])

  // Android hardware back button. Without a handler Capacitor closes the app
  // on the first press, wherever the user happens to be.
  useEffect(() => {
    const plugins = nativePlugins()
    const app = plugins?.App
    if (!app) return

    let handle: PluginListenerHandle | undefined
    let cancelled = false

    void app
      .addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back()
        } else {
          void app.exitApp()
        }
      })
      .then((h) => {
        // The component can unmount before the listener finishes registering;
        // drop it straight away in that case rather than leaking it.
        if (cancelled) void h.remove()
        else handle = h
      })

    return () => {
      cancelled = true
      void handle?.remove()
    }
  }, [])

  // Links to other origins must not navigate the shell — `allowNavigation` in
  // capacitor.config.ts would block them and strand the user on a dead page,
  // with no browser chrome to get back from. Hand them to the system browser.
  useEffect(() => {
    const plugins = nativePlugins()
    const browser = plugins?.Browser
    if (!browser) return

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = (event.target as HTMLElement | null)?.closest?.('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return
      // Let the platform handle tel:/mailto: itself.
      if (/^(tel|mailto|sms):/i.test(href)) return

      let url: URL
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin === window.location.origin) return

      event.preventDefault()
      void browser.open({ url: url.href })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
