"use client";

import LeagueTable from "@components/LeagueTable/LeagueTable";
import { MatchesView } from "@components/MatchesView/page";
import { StatsView } from "@components/StatsView/page";
import { AllResultsView } from "@components/ResultsView/AllResultsView";
import { MobileMatchesView } from '@components/MobileViews/MobileMatchesView';
import { MobileTableView } from '@components/MobileViews/MobileTabelView';
import { MobileAllResultsView } from '@components/MobileViews/MobileAllResultsView';
import NewsView from "@components/NewsView/page";
import MobileNewsView from '@components/MobileViews/MobileNewsView';
import Teams from "@components/Teams/teams";
import Header from "@shared-component/Header";
import SideBar from "@shared-component/SideBar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from '@/store/authStore';
import { Plus } from 'lucide-react';

function TeamsContent() {
  const canAddTeam = useAuthStore((s) => s.canAddTeam);
  const [showAddTeam, setShowAddTeam] = useState(false);
  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#004556]">Teams</h1>
        {canAddTeam() && (
          <button
            type="button"
            onClick={() => setShowAddTeam(true)}
            className="flex items-center gap-2 rounded-lg bg-[#267c93] px-4 py-2 font-medium text-white transition hover:bg-[#1e6375]"
          >
            <Plus className="w-5 h-5" />
            Add Team
          </button>
        )}
      </div>
      <p className="text-gray-600 mt-2">Coming soon...</p>
      {showAddTeam && (
        <div className="mt-4 rounded-lg border border-[#a6dfe6] bg-[#ecf9ff] p-4">
          Add Team form placeholder (configure when Teams collection is ready).
          <button
            type="button"
            onClick={() => setShowAddTeam(false)}
            className="mt-2 text-[#267c93] underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default function DynamicPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const renderDesktopContent = () => {
    switch (slug) {
      case "table":
        return <LeagueTable />;
      case "matches":
        return <MatchesView />;
      case "results":
        return <AllResultsView />;
      case "stats":
        return <StatsView />;
      case "teams":
        return <Teams />;
      case "news":
        return <NewsView />;
      default:
        return <LeagueTable />;
    }
  };

  // Show mobile views on small screens
  const renderMobileContent = () => {
    switch (slug) {
      case "table":
        return <MobileTableView />;
      case "matches":
        return <MobileMatchesView />;
      case "results":
        return <MobileAllResultsView />;
      case "stats":
        return <StatsView />;
      case "teams":
        return <Teams />;
      case "news":
        return <MobileNewsView />;
      default:
        return <MobileTableView />;
    }
  };

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <SideBar />
      <div className="flex-1 overflow-auto md:ml-44.5 md:mt-[86px] md:pb-0 pb-20">
        {isMobile ? renderMobileContent() : renderDesktopContent()}
      </div>
    </main>
  );
}
