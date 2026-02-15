'use client';

import { LogOut, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@constants/shared';
import { MobileAddMatchModal } from './modals/MobileModals/MobileAddMatchModal';
import { useState } from 'react';

export default function SideBar() {
  const pathname = usePathname();
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const [showAddMatchModal, setShowAddMatchModal] = useState(false);

  return (
    <>
      <div className="flex">
         {/* Desktop Sidebar */}
         <aside className="p-3 hidden md:flex md:flex-col md:w-44.5 bg-linear-to-br from-blue-50 to-teal-50 border-r border-gray-200 md:fixed md:left-0 md:top-[120px] md:z-30"
           style={{ height: 'calc(100vh - 120px)' }}>
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
              <button className="flex items-center cursor-pointer gap-2 px-3 py-2 rounded text-[#201f1e] transition-colors hover:bg-white">
                <LogOut className="w-5 h-5 shrink-0 text-[#605e5c]" />
                <span className="font-medium text-[16px]" style={{ lineHeight: '24px', fontFamily: 'Roboto, sans-serif' }}>Logout</span>
              </button>
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
          <div className="flex items-center justify-between px-2 pt-2 pb-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <div key={item.path} className="flex-1 flex justify-center">
                  <Link href={item.path} className="flex flex-col items-center justify-center py-1 px-2">
                    <Icon className={`w-5 h-5 mb-1 ${active ? 'text-[#267c93]' : 'text-[#605e5c]'}`} />
                    <span className={`text-[12px] ${active ? 'text-[#267c93]' : 'text-[#605e5c]'}`}>{item.label}</span>
                    {active && <span className="mt-1 w-9 h-0.75 bg-[#267c93] rounded" />}
                  </Link>
                </div>
              );
            })}

            {/* Floating Add Button centered */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-6">
              <button 
                  onClick={() => setShowAddMatchModal(true)}
                  className="w-12 h-12 bg-[#267c93] rounded-[12px] flex items-center justify-center shadow-lg border-2 border-white">
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileAddMatchModal
        isOpen={showAddMatchModal}
        onClose={() => setShowAddMatchModal(false)}
        onSubmit={(data) => console.log('Add Match:', data)}
      />
    </>
  );
}
