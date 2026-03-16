'use client'

import { Toaster as SonnerToaster } from 'sonner'

/**
 * Toast notifications at top center, responsive (safe area + max-width on mobile).
 * Usage: import { toast } from 'sonner'
 *   toast.success('Done')
 *   toast.error('Failed')
 *   toast('Message')
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: 'Roboto, sans-serif',
          maxWidth: 'min(calc(100vw - 2rem), 22rem)',
          marginTop: 'env(safe-area-inset-top, 0.5rem)',
        },
      }}
      style={{
        '--width': 'min(calc(100vw - 2rem), 22rem)',
        '--left': '50%',
        '--transform': 'translateX(-50%)',
      } as React.CSSProperties}
    />
  )
}
