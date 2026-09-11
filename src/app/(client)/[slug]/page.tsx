"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { AppShell } from "@shared-component/AppShell";
import { FullPageLoader } from "@shared-component/FullPageLoader";
import { useIsMobileResolved } from "@/hooks/use-mobile";

/**
 * Six routes are served by this one client page, so static imports meant every
 * route shipped all twelve views — desktop and mobile — in a single chunk
 * (~11k lines of TSX, first requested at the moment of login). Loading each
 * view dynamically lets Next split them, so /table ships only LeagueTable.
 */
const loading = () => <FullPageLoader message="Loading..." />;

const LeagueTable = dynamic(() => import("@components/LeagueTable/LeagueTable"), { loading });
const MatchesView = dynamic(
  () => import("@components/MatchesView/page").then((m) => m.MatchesView),
  { loading },
);
const StatsView = dynamic(
  () => import("@components/StatsView/page").then((m) => m.StatsView),
  { loading },
);
const AllResultsView = dynamic(
  () => import("@components/ResultsView/AllResultsView").then((m) => m.AllResultsView),
  { loading },
);
const NewsView = dynamic(() => import("@components/NewsView/page"), { loading });
const Teams = dynamic(() => import("@components/Teams/teams"), { loading });
const BudgetView = dynamic(
  () => import("@components/BudgetView/page").then((m) => m.BudgetView),
  { loading },
);

const MobileTableView = dynamic(
  () => import("@components/MobileViews/MobileTabelView").then((m) => m.MobileTableView),
  { loading },
);
const MobileMatchesView = dynamic(
  () => import("@components/MobileViews/MobileMatchesView").then((m) => m.MobileMatchesView),
  { loading },
);
const MobileAllResultsView = dynamic(
  () => import("@components/MobileViews/MobileAllResultsView").then((m) => m.MobileAllResultsView),
  { loading },
);
const MobileNewsView = dynamic(() => import("@components/MobileViews/MobileNewsView"), { loading });

export default function DynamicPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const isMobile = useIsMobileResolved();

  const renderDesktopContent = () => {
    switch (slug) {
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
      case "budget":
        return <BudgetView />;
      case "table":
      default:
        return <LeagueTable />;
    }
  };

  const renderMobileContent = () => {
    switch (slug) {
      case "matches":
        return <MobileMatchesView />;
      case "results":
        return <MobileAllResultsView />;
      // StatsView, Teams and BudgetView handle their own responsive layout.
      case "stats":
        return <StatsView />;
      case "teams":
        return <Teams />;
      case "budget":
        return <BudgetView />;
      case "news":
        return <MobileNewsView />;
      case "table":
      default:
        return <MobileTableView />;
    }
  };

  return (
    <AppShell>
      {/* Wait for the real viewport before committing to a tree — rendering
          desktop first and correcting later remounts everything and re-runs
          every query. */}
      {isMobile === undefined ? (
        <FullPageLoader message="Loading..." />
      ) : isMobile ? (
        renderMobileContent()
      ) : (
        renderDesktopContent()
      )}
    </AppShell>
  );
}
