"use client";

import LeagueTable from "@components/LeagueTable/LeagueTable";
import { MatchesView } from "@components/MatchesView/page";
import { StatsView } from "@components/StatsView/page";
import { MobileMatchesView } from '@components/MobileViews/MobileMatchesView';
import { MobileTableView } from '@components/MobileViews/MobileTabelView';
import Header from "@shared-component/Header";
import SideBar from "@shared-component/SideBar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
      case "stats":
        return <StatsView />;
      case "teams":
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

  // Show mobile views on small screens
  const renderMobileContent = () => {
    switch (slug) {
      case "table":
        return <MobileTableView />;
      case "matches":
        return <MobileMatchesView />;
      case "stats":
        return <StatsView />;
      case "teams":
      // return <MobileTeamsView />;
      default:
      return <MobileTableView />;
    }
  };

  return (
    <main className="flex flex-col h-screen">
      <Header />
      <SideBar />
      <div className="flex-1 overflow-auto md:ml-44.5 md:mt-30 md:pb-0 pb-20">
        {isMobile ? renderMobileContent() : renderDesktopContent()}
      </div>
    </main>
  );
}
