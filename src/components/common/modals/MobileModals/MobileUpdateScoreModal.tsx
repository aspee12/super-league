import { ScoreModalProps } from '@app-types/shared-type';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export function MobileUpdateScoreModal({ isOpen, onClose, onUpdate }: ScoreModalProps) {
  const [formData, setFormData] = useState({
    team: '',
    player: '',
    score: '',
    assist: '',
    card: '',
  });

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col sm:bg-black/50 sm:items-center sm:justify-center sm:p-4 z-9999">
      {/* Full-page modal for mobile, centered modal for desktop */}
      <div className="bg-white w-full h-full flex flex-col sm:h-auto sm:rounded-lg sm:max-w-md sm:shadow-xl">
        {/* Header - only show on desktop */}
        <div className="hidden sm:flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Update</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 sm:p-6">
          <div className="flex-1 space-y-6 sm:space-y-4">
            <div className="relative">
              <select
                value={formData.team}
                onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                className="w-full px-0 py-3 border-b border-[#0e7490] text-gray-700 focus:outline-none focus:border-[#0c6380] appearance-none bg-transparent text-base sm:text-sm"
              >
                <option value="" className="text-gray-500">Select Team</option>
                <option value="team1">Single Aunty</option>
                <option value="team2">Uncle</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
            </div>

            <div className="relative">
              <select
                value={formData.player}
                onChange={(e) => setFormData({ ...formData, player: e.target.value })}
                className="w-full px-0 py-3 border-b border-[#0e7490] text-gray-700 focus:outline-none focus:border-[#0c6380] appearance-none bg-transparent text-base sm:text-sm"
              >
                <option value="" className="text-gray-500">Player</option>
                <option value="player1">Karma Dorji</option>
                <option value="player2">Sonam Wang</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
            </div>

            <div className="relative">
              <select
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                className="w-full px-0 py-3 border-b border-[#0e7490] text-gray-700 focus:outline-none focus:border-[#0c6380] appearance-none bg-transparent text-base sm:text-sm"
              >
                <option value="" className="text-gray-500">Score</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
            </div>

            <div className="relative">
              <select
                value={formData.assist}
                onChange={(e) => setFormData({ ...formData, assist: e.target.value })}
                className="w-full px-0 py-3 border-b border-[#0e7490] text-gray-700 focus:outline-none focus:border-[#0c6380] appearance-none bg-transparent text-base sm:text-sm"
              >
                <option value="" className="text-gray-500">Assist</option>
                <option value="player1">Karma Dorji</option>
                <option value="player2">Sonam Wang</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
            </div>

            <div className="relative">
              <select
                value={formData.card}
                onChange={(e) => setFormData({ ...formData, card: e.target.value })}
                className="w-full px-0 py-3 border-b border-[#0e7490] text-gray-700 focus:outline-none focus:border-[#0c6380] appearance-none bg-transparent text-base sm:text-sm"
              >
                <option value="" className="text-gray-500">Card</option>
                <option value="yellow">Yellow Card</option>
                <option value="red">Red Card</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Action buttons - fixed at bottom on mobile */}
          <div className="flex gap-3 pt-6 mt-auto sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-base sm:text-sm text-[#0e7490] border border-[#0e7490] rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 text-base sm:text-sm text-white bg-[#0e7490] rounded-md hover:bg-[#0c6380] active:bg-[#0a5569] transition-colors font-medium"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
