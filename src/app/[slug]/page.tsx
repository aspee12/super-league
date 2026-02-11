'use client';

import LeagueTable from '@components/LeagueTable/LeagueTable';
import Header from '@shared-component/Header';
import SideBar from '@shared-component/SideBar';
import { useParams } from 'next/navigation';


export default function DynamicPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const renderContent = () => {
    switch (slug) {
      case 'table':
        return <LeagueTable />;
      case 'matches':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Matches</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        );
      case 'stats':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Stats</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        );
      case 'teams':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Teams</h1>
            <p className="text-gray-600 mt-2">Coming soon...</p>
          </div>
        );
      default:
        return <LeagueTable />;
    }
  };

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <SideBar />
      <div className="flex-1 overflow-auto md:ml-44.5 md:mt-30 md:pb-0 pb-20">
        {renderContent()}
      </div>
    </main>
  );
}
