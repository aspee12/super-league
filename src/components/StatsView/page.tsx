'use client';

import { useState } from 'react';
import { useStats, type AggregatedPlayerStat } from '@/hooks/useStats';
import { CATEGORY_CONFIG, StatCategory } from '@constants/stats';

export function StatsView() {
  const [activeCategory, setActiveCategory] = useState<StatCategory>('goals');
  const { topScorers, topAssists, topYellowCards, topRedCards } = useStats();
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
      case 'yellowCard':
        return stat.yellowCards;
      case 'redCard':
        return stat.redCards;
      default:
        return stat.goals;
    }
  };

  const currentStats = getStatsForCategory();

  return (
    <div className="flex-1 min-h-0 flex flex-col px-4 py-4 md:px-8 md:py-6 md:block">
      {/* Mobile: Horizontal tabs */}
      <div className="flex gap-2 mb-4 md:hidden">
        {categories.map((categoryId) => {
          const config = CATEGORY_CONFIG[categoryId];
          const isActive = activeCategory === categoryId;
          return (
            <button
              key={categoryId}
              type="button"
              onClick={() => setActiveCategory(categoryId)}
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
        <div className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-[#e7e6e6]">
            <h2 className="font-bold text-[20px] leading-[30px] tracking-[0.25px] text-[#201f1e] mb-4">
              Player Statistics
            </h2>
            <div className="space-y-2">
              {categories.map((categoryId) => {
                const config = CATEGORY_CONFIG[categoryId];
                const Icon = config.icon;
                const isActive = activeCategory === categoryId;
                return (
                  <button
                    key={categoryId}
                    type="button"
                    onClick={() => setActiveCategory(categoryId)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[16px] leading-[28px] transition-colors ${
                      isActive
                        ? 'bg-[#267c93] text-white'
                        : 'bg-[#f5f5f5] text-[#605e5c] border border-[#e7e6e6] hover:bg-[#e7e6e6]'
                    }`}
                  >
                    <Icon size={20} className={config.iconClassName} />
                    <span>{config.label}</span>
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
                {currentStats.map((stat, index) => (
                  <div
                    key={stat.id}
                    className="flex items-center justify-between gap-3 px-4 py-4 md:px-6 md:py-4 min-h-[72px]"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                      <span
                        className="text-[20px] md:text-[24px] font-bold leading-[30px] md:leading-[36px] text-[#bebbb8] shrink-0 w-6 md:w-8 tabular-nums text-left"
                        aria-hidden
                      >
                        {index + 1}
                      </span>
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#e7e6e6] flex items-center justify-center text-xl md:text-2xl shrink-0 overflow-hidden">
                        {stat.player.avatar || stat.player.name.charAt(0)}
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
        </div>
      </div>
    </div>
  );
}
