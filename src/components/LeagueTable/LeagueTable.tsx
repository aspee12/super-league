'use client'

import { useState } from 'react'
import { useStandings } from '@/hooks/useStandings'
import { TeamLogo } from '@shared-component/TeamLogo'

type MobileTab = 'short' | 'full' | 'form'

function PositionIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" className="inline-block">
        <polygon points="5,0 10,10 0,10" fill="#00ff87" />
      </svg>
    )
  }
  if (change < 0) {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" className="inline-block">
        <polygon points="5,10 10,0 0,0" fill="#ff2882" />
      </svg>
    )
  }
  return <span className="inline-block w-2.5 h-0.5 bg-gray-400 rounded-full" />
}

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  const color =
    result === 'W' ? 'bg-[#00ff87]' : result === 'D' ? 'bg-gray-400' : 'bg-[#ff2882]'
  return (
    <span
      className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold ${color} ${
        result === 'W' ? 'text-gray-900' : 'text-white'
      }`}
      title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
    >
      {result}
    </span>
  )
}

export default function LeagueTable() {
  const { standings, isLoading } = useStandings()
  const [mobileTab, setMobileTab] = useState<MobileTab>('short')

  if (isLoading) {
    return (
      <div className="w-full pt-4 px-4 md:px-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">League Table</h1>
        <div className="flex items-center justify-center py-20 text-gray-500">
          Loading standings...
        </div>
      </div>
    )
  }

  if (standings.length === 0) {
    return (
      <div className="w-full pt-4 px-4 md:px-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">League Table</h1>
        <div className="flex items-center justify-center py-20 text-gray-500">
          No teams or matches yet.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full from-blue-100 via-blue-50 to-cyan-100 pt-4 px-4 md:px-6">
      {/* Desktop View */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">League Table</h1>

        <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
          <table className="w-full border-collapse">
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
                <th className="px-4 py-3 text-center text-sm font-bold">NEXT</th>
              </tr>
            </thead>

            <tbody>
              {standings.map((entry, index) => (
                <tr
                  key={entry.team.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center gap-1">
                      <span className="w-4">{entry.position}</span>
                      <PositionIndicator change={entry.positionChange} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <TeamLogo logo={entry.team.logo} name={entry.team.name} className="w-6 h-6" />
                      <span>{entry.team.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{entry.played}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{entry.won}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{entry.drawn}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{entry.lost}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{entry.goalsFor}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700">{entry.goalsAgainst}</td>
                  <td className="px-4 py-4 text-sm text-center text-gray-700 font-semibold">{entry.goalDifference}</td>
                  <td className="px-4 py-4 text-sm text-center font-bold text-gray-900">{entry.points}</td>
                  <td className="px-4 py-4 text-sm text-center">
                    <div className="flex gap-1 justify-center">
                      {entry.form.length > 0 ? (
                        entry.form.map((result, idx) => (
                          <FormDot key={idx} result={result} />
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    {entry.nextOpponent ? (
                      <TeamLogo logo={entry.nextOpponent.logo} name={entry.nextOpponent.name} className="w-6 h-6" />
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
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

        {/* Tab Switcher */}
        <div className="mb-3 bg-gray-200 rounded-full p-1 flex">
          {(['short', 'full', 'form'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors capitalize ${
                mobileTab === tab
                  ? 'bg-[#004556] text-white shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={`rounded-lg shadow-lg bg-white ${mobileTab === 'full' ? 'overflow-x-auto' : 'overflow-hidden'}`}>
          <table className={`border-collapse ${mobileTab === 'full' ? 'min-w-[600px] w-full' : 'w-full'}`}>
            <thead>
              <tr className="bg-[#004556] text-white">
                <th className="px-3 py-2 text-left text-xs font-bold">Pos</th>
                <th className="px-3 py-2 text-left text-xs font-bold">Team</th>

                {mobileTab === 'short' && (
                  <>
                    <th className="px-2 py-2 text-center text-xs font-bold">Pl</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">W</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">GD</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">Pts</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">Next</th>
                  </>
                )}

                {mobileTab === 'full' && (
                  <>
                    <th className="px-2 py-2 text-center text-xs font-bold">Pl</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">W</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">D</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">L</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">GF</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">GA</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">GD</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">Pts</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">Next</th>
                  </>
                )}

                {mobileTab === 'form' && (
                  <th className="px-2 py-2 text-center text-xs font-bold">Last 5</th>
                )}
              </tr>
            </thead>

            <tbody>
              {standings.map((entry, index) => (
                <tr
                  key={entry.team.id}
                  className={`border-b border-gray-200 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-3 py-3 text-xs font-semibold text-gray-900">
                    <div className="flex items-center gap-1">
                      <span className="w-5">{String(entry.position).padStart(2, '0')}</span>
                      <PositionIndicator change={entry.positionChange} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <TeamLogo logo={entry.team.logo} name={entry.team.name} className="w-5 h-5" textClassName="text-base" />
                      <span className="truncate">{entry.team.name}</span>
                    </div>
                  </td>

                  {mobileTab === 'short' && (
                    <>
                      <td className="px-2 py-3 text-xs text-center text-gray-700">{entry.played}</td>
                      <td className="px-2 py-3 text-xs text-center text-gray-700">{entry.won}</td>
                      <td className="px-2 py-3 text-xs text-center text-gray-700 font-semibold">{entry.goalDifference}</td>
                      <td className="px-2 py-3 text-xs text-center font-bold text-gray-900">{entry.points}</td>
                      <td className="px-2 py-3 text-center">
                        {entry.nextOpponent ? (
                          <TeamLogo logo={entry.nextOpponent.logo} name={entry.nextOpponent.name} className="w-5 h-5" textClassName="text-base" />
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    </>
                  )}

                  {mobileTab === 'full' && (
                    <>
                      <td className="px-2 py-3 text-xs text-center text-gray-700">{entry.played}</td>
                      <td className="px-2 py-3 text-xs text-center text-gray-700">{entry.won}</td>
                      <td className="px-2 py-3 text-xs text-center text-gray-700">{entry.drawn}</td>
                      <td className="px-2 py-3 text-xs text-center text-gray-700">{entry.lost}</td>
                      <td className="px-2 py-3 text-xs text-center text-gray-700">{entry.goalsFor}</td>
                      <td className="px-2 py-3 text-xs text-center text-gray-700">{entry.goalsAgainst}</td>
                      <td className="px-2 py-3 text-xs text-center text-gray-700 font-semibold">{entry.goalDifference}</td>
                      <td className="px-2 py-3 text-xs text-center font-bold text-gray-900">{entry.points}</td>
                      <td className="px-2 py-3 text-center">
                        {entry.nextOpponent ? (
                          <TeamLogo logo={entry.nextOpponent.logo} name={entry.nextOpponent.name} className="w-5 h-5" textClassName="text-base" />
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    </>
                  )}

                  {mobileTab === 'form' && (
                    <td className="px-2 py-3 text-xs">
                      <div className="flex gap-1 justify-center">
                        {entry.form.length > 0 ? (
                          entry.form.map((result, idx) => (
                            <FormDot key={idx} result={result} />
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
