'use client';

import { AddMatchModalProps } from '@app-types/shared-type';
import { X, ChevronDown, Calendar, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export function MobileAddMatchModal({ isOpen, onClose, onSubmit, initialData, title, submitText }: AddMatchModalProps) {
  const [formData, setFormData] = useState({
    teamA: '',
    teamB: '',
    date: '',
    time: '',
  });
  const isEditMode = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  // ✅ Prefill form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        teamA: initialData.teamA || "",
        teamB: initialData.teamB || "",
        date: initialData.date || "",
        time: initialData.time || "",
      });
    } else {
      setFormData({
        teamA: "",
        teamB: "",
        date: "",
        time: "",
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center md:justify-center z-9999">
      <div className="bg-white rounded-t-2xl md:rounded-lg w-full md:max-w-sm">
        <div className="flex items-center justify-center pt-2 pb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold text-center mb-6">{title || (isEditMode ? 'Edit Match' : 'Add New Match')}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <select
                value={formData.teamA}
                onChange={(e) => setFormData({ ...formData, teamA: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0e7490] appearance-none"
              >
                <option value="">Select Team A</option>
                <option value="team1">Single Aunty</option>
                <option value="team2">Uncle</option>
                <option value="team3">Family</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>

            <div className="relative">
              <select
                value={formData.teamB}
                onChange={(e) => setFormData({ ...formData, teamB: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0e7490] appearance-none"
              >
                <option value="">Select Team B</option>
                <option value="team1">Single Aunty</option>
                <option value="team2">Uncle</option>
                <option value="team3">Family</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="Select Date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  placeholder="Select Time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 text-sm text-[#0e7490] border border-[#0e7490] rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-sm text-white bg-[#0e7490] rounded-md hover:bg-[#0c6380] transition-colors"
              >
                {submitText || (isEditMode ? 'Update Match' : 'Add Match')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
