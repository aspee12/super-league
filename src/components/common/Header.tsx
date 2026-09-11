'use client';

import { LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { logout as logoutApi } from '@/lib/auth-api';
import { useSeasons } from '@/hooks/useSeasons';

export default function Header() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const { activeSeason, viewingSeason, isViewingActiveSeason } = useSeasons();

  // Show the season being viewed, flagging it when it isn't the live one.
  const seasonLabel = viewingSeason
    ? `${viewingSeason.name}${isViewingActiveSeason ? '' : ' (archive)'}`
    : (activeSeason?.name ?? '');

  const handleLogout = async () => {
    await logoutApi();
    logoutStore();
    // Drop every cached query — otherwise the next user to sign in on this
    // browser sees the previous user's matches, teams, players and news.
    queryClient.clear();
    router.replace('/login');
  };

  // The native wrapper draws the WebView under the status bar, so the header
  // reserves that inset itself. In a desktop browser the inset resolves to 0
  // and the fixed 86px height is unchanged.
  return (
    <header
      data-node-id="10100:7684"
      style={{
        backgroundImage:
          'linear-gradient(176.57deg, rgba(255,255,255,0.5) 25.972%, rgba(236,249,255,0.1) 48.58%, rgba(38,124,147,0.12) 74.614%)',
      }}
      className="fixed top-0 left-0 right-0 z-40 w-full border-b border-[#e7e6e6] bg-white overflow-hidden pt-[env(safe-area-inset-top)] md:h-[calc(86px_+_env(safe-area-inset-top))]"
    >
      {/* Decorative crest watermark bleeding off the right edge */}
      <Image
        alt=""
        aria-hidden
        src="/assets/header-watermark.png"
        width={175}
        height={175}
        className="pointer-events-none absolute hidden md:block opacity-10 w-[175px] h-[175px] object-cover -right-[30px] top-[56px]"
      />

      <div className="relative flex items-center gap-2 px-3 py-4 md:gap-3 md:px-0 md:h-[86px] md:pl-[42px] md:pr-6 md:py-6">
        <div className="shrink-0 w-10 h-10 md:w-[52px] md:h-[52px]">
          <Image
            alt="Selise Super League Logo"
            src="/assets/ssl-logo.png"
            width={52}
            height={52}
            priority
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-1 min-w-0 flex-col justify-center">
          <p
            className="font-bold text-[#004556] truncate"
            style={{ letterSpacing: '0.25px', fontFamily: 'Roboto, sans-serif' }}
          >
            <span className="text-[20px] leading-tight md:text-[32px] md:leading-[48px]">
              Selise
            </span>
            <span className="text-[16px] md:text-[24px] md:leading-9"> Super League</span>
          </p>

          {/* Every mobile screen already carries a SeasonFilter showing the
              same value, so repeating it here just spent a line of permanent
              chrome on a fact stated directly below. Kept on mobile only when
              an archive is on show, where it's a warning rather than an echo. */}
          <p
            className={`font-bold text-[12px] leading-[24px] md:text-[14px] ${
              isViewingActiveSeason
                ? 'hidden md:block text-[#605e5c]'
                : 'text-[#a4262c]'
            }`}
            style={{ letterSpacing: '0.5px', fontFamily: 'Roboto, sans-serif' }}
          >
            {seasonLabel}
          </p>
        </div>

        {user ? (
          /* Below `sm` the word is dropped and the icon carries the button, so
             the league name has room to read in full instead of truncating. */
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="shrink-0 flex items-center gap-2 rounded-[80px] border-[1.5px] border-[#00586b] bg-white px-3 py-1.5 sm:px-4 text-[#00586b] transition-colors hover:bg-[#00586b]/5"
          >
            <LogOut className="w-4 h-4" />
            <span
              className="hidden sm:inline font-bold text-[14px] leading-6"
              style={{ letterSpacing: '0.15px', fontFamily: 'Roboto, sans-serif' }}
            >
              Logout
            </span>
          </button>
        ) : (
          <Link
            href="/login"
            className="shrink-0 flex items-center justify-center gap-2 rounded-[80px] border-[1.5px] border-[#00586b] bg-white px-4 py-1.5 text-[#00586b] transition-colors hover:bg-[#00586b]/5"
          >
            <span
              className="font-bold text-[14px] leading-6"
              style={{ letterSpacing: '0.15px', fontFamily: 'Roboto, sans-serif' }}
            >
              Sign in
            </span>
          </Link>
        )}
      </div>
    </header>
  );
}
