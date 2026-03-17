'use client'

import { useState } from 'react'
import { useStandings } from '@/hooks/useStandings'

type MobileTab = 'short' | 'full' | 'form'

function PositionIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <svg width="8" height="8" viewBox="0 0 10 10" className="inline-block">
        <polygon points="5,0 10,10 0,10" fill="#00ff87" />
      </svg>
    )
  }
  if (change < 0) {
    return (
      <svg width="8" height="8" viewBox="0 0 10 10" className="inline-block">
        <polygon points="5,10 10,0 0,0" fill="#ff2882" />
      </svg>
    )
  }
  return <span className="inline-block w-2 h-0.5 bg-gray-400 rounded-full" />
}

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  const color =
    result === 'W' ? 'bg-[#00ff87]' : result === 'D' ? 'bg-gray-400' : 'bg-[#ff2882]'
  return (
    <span
      className={`w-[18px] h-[18px] rounded-full flex items-center justify-center text-[8px] font-bold ${color} ${
        result === 'W' ? 'text-gray-900' : 'text-white'
      }`}
    >
      {result}
    </span>
  )
}

export function MobileTableView() {
  const { standings, isLoading } = useStandings()
  const [activeTab, setActiveTab] = useState<MobileTab>('short')

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20 mt-10 px-4">
        <div className="flex items-center justify-center py-20 text-gray-500">
          Loading standings...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen from-[#d5e5ec] via-[#e0f2f1] to-[#c8e6d4] pb-20 mt-10">
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 py-3 bg-white">
            <h2 className="font-semibold text-gray-800">League Table</h2>
          </div>

          {/* Tab Switcher */}
          <div className="mx-4 mb-3 bg-gray-200 rounded-full p-1 flex">
            {(['short', 'full', 'form'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-[#0e7490] text-white shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className={activeTab === 'full' ? 'overflow-x-auto' : 'overflow-hidden'}>
            <table className={`text-sm ${activeTab === 'full' ? 'min-w-[600px] w-full' : 'w-full'}`}>
              <thead>
                <tr className="bg-[#0e7490] text-white">
                  <th className="px-3 py-3 text-left text-xs font-semibold">Pos</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold">Team</th>

                  {activeTab === 'short' && (
                    <>
                      <th className="px-2 py-3 text-center text-xs font-semibold">Pl</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">W</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">GD</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">Pts</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">Next</th>
                    </>
                  )}

                  {activeTab === 'full' && (
                    <>
                      <th className="px-2 py-3 text-center text-xs font-semibold">Pl</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">W</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">D</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">L</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">GF</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">GA</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">GD</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">Pts</th>
                      <th className="px-2 py-3 text-center text-xs font-semibold">Next</th>
                    </>
                  )}

                  {activeTab === 'form' && (
                    <th className="px-2 py-3 text-center text-xs font-semibold">Last 5</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white">
                {standings.map((entry, index) => (
                  <tr
                    key={entry.team.id}
                    className={`border-b border-gray-100 text-black ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium w-5">
                          {String(entry.position).padStart(2, '0')}
                        </span>
                        <PositionIndicator change={entry.positionChange} />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{entry.team.logo}</span>
                        <span className="text-xs font-medium truncate text-black">
                          {entry.team.name}
                        </span>
                      </div>
                    </td>

                    {activeTab === 'short' && (
                      <>
                        <td className="px-2 py-3 text-center text-xs text-black">{entry.played}</td>
                        <td className="px-2 py-3 text-center text-xs text-black">{entry.won}</td>
                        <td className="px-2 py-3 text-center text-xs font-semibold text-black">{entry.goalDifference}</td>
                        <td className="px-2 py-3 text-center text-xs font-bold text-black">{entry.points}</td>
                        <td className="px-2 py-3 text-center">
                          {entry.nextOpponent ? (
                            <span className="text-base" title={entry.nextOpponent.name}>{entry.nextOpponent.logo}</span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </>
                    )}

                    {activeTab === 'full' && (
                      <>
                        <td className="px-2 py-3 text-center text-xs text-black">{entry.played}</td>
                        <td className="px-2 py-3 text-center text-xs text-black">{entry.won}</td>
                        <td className="px-2 py-3 text-center text-xs text-black">{entry.drawn}</td>
                        <td className="px-2 py-3 text-center text-xs text-black">{entry.lost}</td>
                        <td className="px-2 py-3 text-center text-xs text-black">{entry.goalsFor}</td>
                        <td className="px-2 py-3 text-center text-xs text-black">{entry.goalsAgainst}</td>
                        <td className="px-2 py-3 text-center text-xs font-semibold text-black">{entry.goalDifference}</td>
                        <td className="px-2 py-3 text-center text-xs font-bold text-black">{entry.points}</td>
                        <td className="px-2 py-3 text-center">
                          {entry.nextOpponent ? (
                            <span className="text-base" title={entry.nextOpponent.name}>{entry.nextOpponent.logo}</span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      </>
                    )}

                    {activeTab === 'form' && (
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
    </div>
  )
}
