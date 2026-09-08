'use client';

import { useState } from 'react';
import { useStats, type AggregatedPlayerStat } from '@/hooks/useStats';
import { CATEGORY_CONFIG, StatCategory } from '@constants/stats';
import { ArchiveSeasonNotice, SeasonFilter } from '@shared-component/SeasonFilter';
import { ListPagination, paginate } from '@shared-component/ListPagination';

/** Leaderboard rows per page. */
const PAGE_SIZE = 10;

export function StatsView() {
  const [activeCategory, setActiveCategory] = useState<StatCategory>('goals');
  const [page, setPage] = useState(1);
  const { topScorers, topAssists, topYellowCards, topRedCards, topCleanSheets } = useStats();
  const activeConfig = CATEGORY_CONFIG[activeCategory];
  const IconComponent = activeConfig.icon;
  const categories = Object.keys(CATEGORY_CONFIG) as StatCategory[];

  // Pick the right sorted list based on active category
  const getStatsForCategory = (): AggregatedPlayerStat[] => {
    switch (activeCategory) {
      case 'goals':
        return topScorers;
      case 'assists':
        return topAssists;
      case 'cleanSheet':
        return topCleanSheets;
      case 'yellowCard':
        return topYellowCards;
      case 'redCard':
        return topRedCards;
      default:
        return topScorers;
    }
  };

  const getValueForCategory = (stat: AggregatedPlayerStat): number => {
    switch (activeCategory) {
      case 'goals':
        return stat.goals;
      case 'assists':
        return stat.assists;
      case 'cleanSheet':
        return stat.cleanSheets;
      case 'yellowCard':
        return stat.yellowCards;
      case 'redCard':
        return stat.redCards;
      default:
        return stat.goals;
    }
  };

  const currentStats = getStatsForCategory();
  const { pageCount, safePage, offset, visible, summary } = paginate(
    currentStats,
    page,
    PAGE_SIZE,
  );

  /** Switching leaderboards should start back at the top of the ranking. */
  const handleCategoryChange = (categoryId: StatCategory) => {
    setActiveCategory(categoryId);
    setPage(1);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col px-4 py-4 md:px-8 md:py-6 md:block">
      <div className="mb-4">
        <h1
          className="hidden md:block font-bold text-[20px] leading-[30px] text-[#201f1e] mb-3"
          style={{ letterSpacing: '0.25px' }}
        >
          Player Statistics
        </h1>
        <SeasonFilter showReset={false} />
      </div>
      <ArchiveSeasonNotice />

      {/* Mobile: Horizontal tabs */}
      <div className="flex gap-2 mb-4 md:hidden">
        {categories.map((categoryId) => {
          const config = CATEGORY_CONFIG[categoryId];
          const isActive = activeCategory === categoryId;
          return (
            <button
              key={categoryId}
              type="button"
              onClick={() => handleCategoryChange(categoryId)}
              className={`flex-1 min-w-0 py-3 px-3 rounded-lg text-[14px] font-medium leading-[20px] transition-colors ${
                isActive
                  ? 'bg-[#267c93] text-white shadow-sm'
                  : 'bg-white text-[#605e5c] border border-[#e7e6e6]'
              }`}
            >
              {config.shortLabel}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0">
        {/* Desktop: Player Statistics sidebar */}
        <div className="hidden md:block shrink-0">
          <div className="bg-white rounded-[8px] p-6 border border-[#e7e6e6]">
            <div className="flex flex-col gap-4 w-[194px]">
              {categories.map((categoryId) => {
                const config = CATEGORY_CONFIG[categoryId];
                const Icon = config.icon;
                const isActive = activeCategory === categoryId;
                return (
                  <button
                    key={categoryId}
                    type="button"
                    onClick={() => handleCategoryChange(categoryId)}
                    className={`w-full h-[62px] flex items-center gap-3 px-6 py-3 rounded-[8px] transition-colors ${
                      isActive
                        ? 'bg-[#267c93]'
                        : 'bg-white border border-[#e7e6e6] hover:bg-[#f5f5f5]'
                    }`}
                  >
                    <Icon
                      size={28}
                      className={isActive ? 'text-white' : config.iconClassName}
                    />
                    <span
                      className={`font-bold text-[16px] leading-[28px] ${
                        isActive ? 'text-white' : 'text-black'
                      }`}
                      style={{ letterSpacing: '0.5px' }}
                    >
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stat card: header + list */}
        <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm border border-[#e7e6e6] overflow-hidden flex flex-col">
          <div className="px-4 py-4 md:px-6 md:py-4 border-b border-[#e7e6e6] flex items-center gap-3 shrink-0">
            <IconComponent
              size={24}
              className={activeConfig.iconClassName ?? 'text-[#267c93]'}
              aria-hidden
            />
            <h2 className="font-bold text-[20px] leading-[30px] md:text-[24px] md:leading-[36px] tracking-[0.25px] text-[#201f1e]">
              {activeConfig.cardTitle}
            </h2>
          </div>

          <div className="flex-1 overflow-auto">
            {currentStats.length > 0 ? (
              <div className="divide-y divide-[#e7e6e6]">
                {visible.map((stat, index) => (
                  <div
                    key={stat.id}
                    className="flex items-center justify-between gap-3 px-4 py-4 md:px-6 md:py-4 min-h-[72px]"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                      <span
                        className="text-[20px] md:text-[24px] font-bold leading-[30px] md:leading-[36px] text-[#bebbb8] shrink-0 w-6 md:w-8 tabular-nums text-left"
                        aria-hidden
                      >
                        {offset + index + 1}
                      </span>
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e7e6e6] flex items-center justify-center text-xl md:text-2xl shrink-0 overflow-hidden">
                        {stat.player.avatar && (stat.player.avatar.startsWith('/') || stat.player.avatar.startsWith('http')) ? (
                          <img src={stat.player.avatar} alt={stat.player.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-gray-500">
                            {stat.player.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold md:font-normal text-[14px] md:text-[16px] leading-[22px] md:leading-[28px] text-[#201f1e] truncate">
                          {stat.player.name}
                        </div>
                        <div className="text-[12px] md:text-[14px] leading-[20px] md:leading-[24px] text-[#605e5c] truncate">
                          {stat.player.team}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[20px] md:text-[24px] font-bold leading-[30px] md:leading-[36px] text-[#201f1e] tabular-nums">
                        {getValueForCategory(stat)}
                      </div>
                      <div className="text-[11px] md:text-[12px] leading-[16px] md:leading-[18px] text-[#605e5c]">
                        {activeConfig.valueLabel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <p>No stats recorded yet. Play some matches first.</p>
              </div>
            )}
          </div>

          <ListPagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={setPage}
            summary={summary}
            className="shrink-0"
          />
        </div>
      </div>
    </div>
  );
}
