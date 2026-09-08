import type { Metadata } from "next";
import Image from "next/image";
import "../../styles/globals.css";
import { Providers } from "./providers";
import { Toaster } from "@ui/Toaster";
import { SessionRestore } from "@components/auth/SessionRestore";

export const metadata: Metadata = {
  title: "ssl-portal",
  description: "Selise Super League Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          <SessionRestore />
          <Toaster />
          {/* Background Wrapper */}
          <div className="relative min-h-screen w-full bg-[lightgray]">
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
            <div className="relative z-10 min-h-screen">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
