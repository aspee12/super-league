'use client';

import { LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { navItems } from '@constants/shared';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useSeasons } from '@/hooks/useSeasons';
import { logout as logoutApi } from '@/lib/auth-api';

/**
 * Nav items to the left of the floating add button; the rest sit to its right.
 * The two sides must stay equal in width even though they hold different
 * numbers of items: the button is centred on the bar, so it only lands in the
 * gap between them while that gap is centred too.
 */
const MOBILE_NAV_SPLIT = 3;

/**
 * The sidebar renders on every authenticated page, and this modal pulls in
 * react-day-picker + date-fns via DatePicker. Loading it on demand keeps that
 * stack out of the initial bundle for users who never open it.
 */
const MobileAddMatchModal = dynamic(
  () => import('./modals/MobileModals/MobileAddMatchModal').then((m) => m.MobileAddMatchModal),
  { ssr: false },
);

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logoutStore = useAuthStore((s) => s.logout);
  const { isViewingActiveSeason } = useSeasons();
  // Fixtures can only be added to the season in progress, so the button that
  // opens the form goes away while an archived season is on show.
  const canAddMatch = Boolean(user) && isViewingActiveSeason;

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const [showAddMatchModal, setShowAddMatchModal] = useState(false);

  const handleLogout = async () => {
    await logoutApi();
    logoutStore();
    // Drop every cached query — otherwise the next user to sign in on this
    // browser sees the previous user's matches, teams, players and news.
    queryClient.clear();
    router.replace('/login');
  };

  // Each link claims an equal share of its half and is allowed to shrink, so a
  // narrow phone squeezes the labels instead of pushing the last item off the
  // edge of the screen.
  const renderNavLink = (item: (typeof navItems)[number]) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        href={item.path}
        className="flex flex-1 min-w-0 flex-col items-center justify-center py-1 px-0.5"
      >
        <Icon className={`w-5 h-5 mb-1 shrink-0 ${active ? 'text-[#267c93]' : 'text-[#605e5c]'}`} />
        <span
          className={`w-full truncate text-center text-[11px] leading-[14px] ${
            active ? 'text-[#267c93]' : 'text-[#605e5c]'
          }`}
        >
          {item.label}
        </span>
        {active && <span className="mt-1 h-0.75 w-9 max-w-full bg-[#267c93] rounded" />}
      </Link>
    );
  };

  return (
    <>
      <div className="flex">
         {/* Desktop Sidebar */}
         <aside
           className="p-3 hidden md:flex md:flex-col md:w-44.5 border-r border-gray-200 md:fixed md:left-0 md:top-[86px] md:z-30"
           style={{
             height: 'calc(100vh - 86px)',
             backgroundImage:
               'linear-gradient(169deg, rgb(226,237,240) 1.04%, rgb(232,248,252) 31.97%, rgb(179,219,229) 99.98%)',
           }}
         >
          <nav className="flex-1 flex flex-col pt-2 pb-4 gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                      active ? 'bg-[#267c93] text-white' : 'text-[#201f1e] hover:bg-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-[#605e5c]'}`} />
                    <span className="font-medium text-[16px]" style={{ lineHeight: '24px', fontFamily: 'Roboto, sans-serif' }}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto pb-4">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center cursor-pointer gap-2 px-3 py-2 rounded text-[#201f1e] transition-colors hover:bg-white w-full"
                >
                  <LogOut className="w-5 h-5 shrink-0 text-[#605e5c]" />
                  <span className="font-medium text-[16px]" style={{ lineHeight: '24px', fontFamily: 'Roboto, sans-serif' }}>Logout</span>
                </button>
              ) : null}
              {/* Login button hidden for now
              {!user && (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 rounded text-[#201f1e] transition-colors hover:bg-white w-full"
                >
                  <span className="font-medium text-[16px]" style={{ lineHeight: '24px', fontFamily: 'Roboto, sans-serif' }}>Login</span>
                </Link>
              )}
              */}
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pb-20 md:pb-0">
          {/* Main content will go here */}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#ecf9ff] border-t border-[#a6dfe6] shadow-[0_-6px_16px_rgba(0,0,0,0.08)] z-1000">
        <div className="relative">
          {/* Two equal halves flanking a fixed centre gap, so the floating
              button never lands on top of a nav item. */}
          <div className="flex items-start px-1 pt-2 pb-6">
            <div className="flex flex-1 min-w-0">
              {navItems.slice(0, MOBILE_NAV_SPLIT).map(renderNavLink)}
            </div>
            {canAddMatch && <div className="w-14 shrink-0" aria-hidden />}
            <div className="flex flex-1 min-w-0">
              {navItems.slice(MOBILE_NAV_SPLIT).map(renderNavLink)}
            </div>

            {/* Floating Add Match — signed in, current season only */}
            {canAddMatch && (
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-6">
                <button
                  type="button"
                  onClick={() => setShowAddMatchModal(true)}
                  className="w-12 h-12 bg-[#267c93] rounded-[12px] flex items-center justify-center shadow-lg border-2 border-white"
                >
                  <Plus className="w-6 h-6 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <MobileAddMatchModal
        isOpen={showAddMatchModal}
        onClose={() => setShowAddMatchModal(false)}
        onSubmit={() => setShowAddMatchModal(false)}
        title="Add New Match"
        submitText="Add Match"
      />
    </> 
  );
}
