import { Match } from '@app-types/matchTypes';
import { Pencil, RefreshCw, Trash2 } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  variant?: 'live' | 'upcoming' | 'result';
}

export function MatchCard({ match, showActions = false, onEdit, onDelete, variant }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isUpcoming = match.status === 'upcoming';

  return (
    <div className="bg-white rounded-lg shadow-sm relative">
        {isLive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-l-lg" />
      )}
        {/* Actions */}
      { showActions && (
        <div className="bg-[#F8F9FA] flex justify-end items-center gap-2 px-6 py-3 rounded-t-lg">
          { onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0e7490] bg-[#e0f2f7] hover:bg-[#cce9f0] rounded-md transition-colors"
            >
              <Pencil size={14} />
              <span>Edit</span>
            </button>
          )}
          { onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}

      <div className="p-6 pt-4 relative px-[42px]">
        
      {/* Top scorers info for live/finished matches */}
      {!isUpcoming && (
        <div className="flex justify-between text-xs text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <span>karma Wangchuk:</span>
            <span className="inline-block w-2 h-2 bg-red-600 rounded-sm"></span>
          </div>
          <div className="flex items-center gap-1">
            <span>Yeshi Norbu: 2</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex items-center justify-between">
        {/* Team A */}
        <div className="flex flex-col items-center w-1/4">
          <div className="text-4xl mb-3">{match.teamA.logo}</div>
          <div className="text-sm font-medium text-center text-black">{match.teamA.name}</div>
        </div>

        {/* Score/Time */}
        <div className="flex flex-col items-center flex-1">
          {isUpcoming ? (
            <>
              <div className="text-2xl font-bold mb-1">{match.time}</div>
              <div className="text-gray-600 text-sm mb-2">VS</div>
              <div className="text-gray-600 text-sm">{match.date}</div>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-2">{match.date}</div>
              <div className="flex items-center gap-4 mb-2">
                <div className="text-5xl font-bold text-black">{match.scoreA}</div>
                <div className="text-gray-400">-</div>
                <div className="text-5xl font-bold text-black">{match.scoreB}</div>
              </div>
              <div className="text-xs mb-1 text-black">{match.time}</div>
              {isLive && (
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  ● LIVE
                </div>
              )}
            </>
          )}
        </div>

        {/* Team B */}
        <div className="flex flex-col items-center w-1/4">
          <div className="text-4xl mb-3">{match.teamB.logo}</div>
          <div className="text-sm font-medium text-center text-black">{match.teamB.name}</div>
        </div>
      </div>

      
    </div>
    </div>
  );
}
