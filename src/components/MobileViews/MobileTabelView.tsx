'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';
import { leagueTable } from '../../data/matchMockData';

export function MobileTableView() {
  return (
    <div className="min-h-screen from-[#d5e5ec] via-[#e0f2f1] to-[#c8e6d4] pb-20 mt-10">
      {/* Header */}
      {/* <div className="bg-linear-to-r from-cyan-400 to-teal-400 pt-8 pb-6 px-4 rounded-b-3xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">⚡</div>
          <div>
            <h1 className="text-white text-xl font-bold">Selise Super League</h1>
            <p className="text-white/80 text-sm">Season 1/2026</p>
          </div>
        </div>
      </div> */}

      {/* Content */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 py-3 bg-white">
            <h2 className="font-semibold text-gray-800">League Table</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0e7490] text-white">
                  <th className="px-3 py-3 text-left text-xs font-semibold sticky left-0 bg-[#0e7490]">
                    Pos
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold sticky left-12 bg-[#0e7490] min-w-[120px]">
                    Team
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">PL</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">W</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">D</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">L</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">GF</th>
                  <th className="px-3 py-3 text-center text-xs font-semibold">GA</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {leagueTable.map((entry, index) => (
                  <tr
                    key={entry.team.id}
                    className={`border-b border-gray-100 text-black ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-3 sticky left-0 bg-inherit">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium w-4">{entry.pos}</span>
                        {index < 2 ? (
                          <ChevronUp size={12} className="text-green-500" />
                        ) : index === 2 ? (
                          <ChevronDown size={12} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={12} className="text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 sticky left-12 bg-inherit">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{entry.team.logo}</span>
                        <span className="text-xs font-medium truncate text-black">
                          {entry.team.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-black">{entry.played}</td>
                    <td className="px-3 py-3 text-center text-xs text-black">{entry.won}</td>
                    <td className="px-3 py-3 text-center text-xs text-black">{entry.drawn}</td>
                    <td className="px-3 py-3 text-center text-xs text-black">{entry.lost}</td>
                    <td className="px-3 py-3 text-center text-xs text-black">{entry.goalsFor}</td>
                    <td className="px-3 py-3 text-center text-xs text-black">{entry.goalsAgainst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* <MobileBottomNav activeView={activeView} onViewChange={onViewChange} /> */}
    </div>
  );
}
