'use client';

import { teamsData } from '../../data/leagueData';

export default function LeagueTable() {
  const teams = teamsData;

  return (
    <div className="w-full from-blue-100 via-blue-50 to-cyan-100 pt-4 px-4 md:px-6">
      {/* Desktop View */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">League Table</h1>
        
        {/* Table Container */}
        <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
          <table className="w-full border-collapse">
            {/* Header Row */}
            <thead>
              <tr className="bg-[#004556] text-white">
                <th className="px-4 py-3 text-left text-sm font-bold">Pos</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Club</th>
                <th className="px-4 py-3 text-center text-sm font-bold">PL</th>
                <th className="px-4 py-3 text-center text-sm font-bold">W</th>
                <th className="px-4 py-3 text-center text-sm font-bold">D</th>
                <th className="px-4 py-3 text-center text-sm font-bold">L</th>
                <th className="px-4 py-3 text-center text-sm font-bold">GF</th>
                <th className="px-4 py-3 text-center text-sm font-bold">GA</th>
                <th className="px-4 py-3 text-center text-sm font-bold">GD</th>
                <th className="px-4 py-3 text-center text-sm font-bold">PTS</th>
                <th className="px-4 py-3 text-center text-sm font-bold">FORM</th>
              </tr>
            </thead>
            
            {/* Body Rows */}
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={team.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">{team.position}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{team.logo}</span>
                      <span>{team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{team.played}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{team.won}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{team.drawn}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{team.lost}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{team.goalsFor}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{team.goalsAgainst}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700 font-semibold">{team.goalDifference}</td>
                  <td className="px-4 py-4 text-sm text-center font-bold text-gray-900">{team.points}</td>
                  <td className="px-4 py-4 text-sm text-center">
                    <div className="flex gap-1 justify-center">
                      {team.form.map((result, idx) => (
                        <span
                          key={idx}
                          className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-white ${
                            result === 'W'
                              ? 'bg-green-500'
                              : result === 'D'
                              ? 'bg-gray-400'
                              : 'bg-red-500'
                          }`}
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <h2 className="text-lg font-bold text-gray-800 mb-4">League Table</h2>
        
        {/* Mobile Table */}
        <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
          <table className="w-full border-collapse">
            {/* Header Row */}
            <thead>
              <tr className="bg-[#004556] text-white">
                <th className="px-3 py-2 text-left text-xs font-bold">Pos</th>
                <th className="px-3 py-2 text-left text-xs font-bold">Team</th>
                <th className="px-3 py-2 text-center text-xs font-bold">PL</th>
                <th className="px-3 py-2 text-center text-xs font-bold">W</th>
                <th className="px-3 py-2 text-center text-xs font-bold">D</th>
                <th className="px-3 py-2 text-center text-xs font-bold">L</th>
                <th className="px-3 py-2 text-center text-xs font-bold">GF</th>
                <th className="px-3 py-2 text-center text-xs font-bold">GA</th>
              </tr>
            </thead>
            
            {/* Body Rows */}
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={team.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-3 py-3 text-xs font-semibold text-gray-900">{team.position}</td>
                  <td className="px-3 py-3 text-xs font-semibold text-gray-900">
                    <div className="flex items-center gap-1">
                      <span className="text-base">{team.logo}</span>
                      <span>{team.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-center text-gray-700">{team.played}</td>
                  <td className="px-3 py-3 text-xs text-center text-gray-700">{team.won}</td>
                  <td className="px-3 py-3 text-xs text-center text-gray-700">{team.drawn}</td>
                  <td className="px-3 py-3 text-xs text-center text-gray-700">{team.lost}</td>
                  <td className="px-3 py-3 text-xs text-center text-gray-700">{team.goalsFor}</td>
                  <td className="px-3 py-3 text-xs text-center text-gray-700">{team.goalsAgainst}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
