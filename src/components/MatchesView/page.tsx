import { Pause, Pencil, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { matches } from '../../data/matchMockData';
import { MatchCard } from '@shared-component/MatchCard';

export function MatchesView() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateScoreModal, setShowUpdateScoreModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEndMatchModal, setShowEndMatchModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditUpcomingModal, setShowEditUpcomingModal] = useState(false);
  

  const liveMatch: any = {
    id: 1,
    homeTeam: "Single Aunty",
    awayTeam: "Single Aunty",
    homeScore: 1,
    awayScore: 2,
    date: "21-9-2026",
    time: "20:00",
    status: "live",
    homePlayers: [{ name: "Karma Dorji", goals: 1 }],
    awayPlayers: [
      { name: "Karma Dorji", goals: 1 },
      { name: "Sonam Wang", goals: 1 },
    ],
  };

  const liveMatches = matches.filter((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');
  const finishedMatches = matches.filter((m) => m.status === 'finished');

  return (
    <div className="min-h-screen flex-1 p-6">
      {/* Live Now Section */}
      <div className="hidden md:block mb-4">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <h2 className="text-lg font-semibold text-black">Live Now</h2>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0e7490] text-white rounded-md hover:bg-[#0c6380] transition-colors text-sm"
            >
              <Plus size={16} />
              <span>Add Match</span>
            </button>
          </div>
        </div>


        {liveMatches.length > 0 ? (
          <div className="space-y-4 mt-4">
            {liveMatches.map((match) => (
              <div key={match.id} className="relative bg-[#F8F9FA] rounded-lg shadow-sm">
                <div className=" flex justify-end items-center gap-2 px-6 py-3 rounded-tr-lg">
                  <button
                    onClick={() => setShowUpdateScoreModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0e7490] bg-[#e0f2f7] hover:bg-[#cce9f0] rounded-md transition-colors"
                  >
                    <RefreshCw size={14} />
                    <span>Update Score</span>
                  </button>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0e7490] bg-[#e0f2f7] hover:bg-[#cce9f0] rounded-md transition-colors"
                  >
                    <Pencil size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setShowEndMatchModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0e7490] bg-[#e0f2f7] hover:bg-[#cce9f0] rounded-md transition-colors"
                  >
                    <Pause size={14} />
                    <span>End Match</span>
                  </button>
                </div>
                <MatchCard match={match} variant="live" />
                
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No live matches</div>
        )}
      </div>

      {/* Upcoming Section */}
      <div className="mb-8">
        <div className="bg-[#c5dce6] rounded-t-lg px-6 py-3">
          <h2 className="font-semibold text-[#0c5273]">Upcoming</h2>
        </div>
        <div className="space-y-4 mt-4">
          {upcomingMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              variant="upcoming"
              showActions
              onEdit={() => setShowEditUpcomingModal(true)}
              onDelete={() => setShowDeleteModal(true)}
            />
          ))}
        </div>
      </div>

      {/* Recent Results Section */}
      <div>
        <div className="bg-[#c5e6d4] rounded-t-lg px-6 py-3">
          <h2 className="font-semibold text-[#0c5273]">Recent Results</h2>
        </div>
        <div className="space-y-4 mt-4">
          {finishedMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              variant="result"
              showActions
              onEdit={() => setShowEditModal(true)}
              onDelete={() => setShowDeleteModal(true)}
            />
          ))}
        </div>
      </div>

      {/* Mobile View */}
      {/* <div className="md:hidden p-3">
        <div className="mb-6 bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <h2 className="text-base font-semibold text-gray-800">Live Now</h2>
            <div className="ml-auto px-3 py-1 bg-red-600 text-white rounded-full text-xs font-semibold">
              ● LIVE
            </div>
          </div>
          <div className="shadow-sm border-2 border-red-300 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                  ⚽
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {liveMatch.homeTeam}
                </div>
                {liveMatch.homePlayers?.map((player: any, idx: number) => (
                  <div key={idx} className="text-xs text-gray-600 mt-1">
                    {player.name} {player.goals}
                  </div>
                ))}
              </div>

              <div className="flex-1 text-center px-4">
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {liveMatch.homeScore}-{liveMatch.awayScore}
                </div>
                <div className="text-xs text-gray-600">{liveMatch.date}</div>
                <div className="text-sm font-semibold text-gray-800">
                  {liveMatch.time}
                </div>
              </div>

              <div className="flex-1 text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                  ⚽
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {liveMatch.awayTeam}
                </div>
                {liveMatch.awayPlayers?.map((player, idx) => (
                  <div key={idx} className="text-xs text-gray-600 mt-1">
                    {player.goals} {player.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}


