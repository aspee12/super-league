import type { Metadata } from "next";
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
          <div
            className="relative min-h-screen w-full"
            style={{
              background: "lightgray url('/assets/bg-image.png') no-repeat center / 100% 100%",
            }}
          >
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
