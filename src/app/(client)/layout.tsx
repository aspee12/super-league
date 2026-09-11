import type { Metadata, Viewport } from "next";
import Image from "next/image";
import "../../styles/globals.css";
import { Providers } from "./providers";
import { Toaster } from "@ui/Toaster";
import { SessionRestore } from "@components/auth/SessionRestore";
import { CapacitorBridge } from "@components/native/CapacitorBridge";

export const metadata: Metadata = {
  title: "ssl-portal",
  description: "Selise Super League Portal",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // The layout already reserves the home-indicator inset via
  // `env(safe-area-inset-bottom)`, but those values stay 0 unless the viewport
  // covers the whole screen — so inside the native shell (and on notched
  // phones in the browser) the tab bar would sit under the indicator.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-[100dvh]">
        <Providers>
          <CapacitorBridge />
          <SessionRestore />
          <Toaster />
          {/* Background Wrapper */}
          <div className="relative min-h-[100dvh] w-full bg-[lightgray]">
            {/* Rendered via next/image rather than a CSS background so it is
                served resized and as WebP/AVIF — the raw PNG is 260 KB and
                loads on every page, including login. */}
            <Image
              alt=""
              aria-hidden
              src="/assets/bg-image.png"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />

            {/* Opacity Layer */}
            <div className="absolute inset-0 bg-white/75 z-0" />

            {/* Page Content */}
            <div className="relative z-10 min-h-[100dvh]">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
