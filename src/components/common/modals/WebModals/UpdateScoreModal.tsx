import { ScoreModalProps } from '@app-types/shared-type';
import { X } from 'lucide-react';
import { useState } from 'react';

export function UpdateScoreModal({ isOpen, onClose, onUpdate }: ScoreModalProps) {
  const [formData, setFormData] = useState({
    team: '',
    player: '',
    score: '',
    assist: '',
    card: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Update Score</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
              value={formData.team}
              onChange={(e) =>
                setFormData({ ...formData, team: e.target.value })
              }
            >
              <option value="">Select Team</option>
              <option value="team1">Single Aunty</option>
              <option value="team2">Aunti Jaram</option>
            </select>

            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
              value={formData.player}
              onChange={(e) =>
                setFormData({ ...formData, player: e.target.value })
              }
            >
              <option value="">Player</option>
              <option value="player1">Karma Wangchuk</option>
              <option value="player2">Yeshi Norbu</option>
            </select>

            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
              value={formData.score}
              onChange={(e) =>
                setFormData({ ...formData, score: e.target.value })
              }
            >
              <option value="">Score</option>
              <option value="1">1 Goal</option>
              <option value="2">2 Goals</option>
            </select>

            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
              value={formData.assist}
              onChange={(e) =>
                setFormData({ ...formData, assist: e.target.value })
              }
            >
              <option value="">Assist</option>
              <option value="player1">Player 1</option>
              <option value="player2">Player 2</option>
            </select>

            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
              value={formData.card}
              onChange={(e) =>
                setFormData({ ...formData, card: e.target.value })
              }
            >
              <option value="">Card</option>
              <option value="yellow">Yellow Card</option>
              <option value="red">Red Card</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-[#0e7490] rounded-md hover:bg-[#0c6380] transition-colors"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
