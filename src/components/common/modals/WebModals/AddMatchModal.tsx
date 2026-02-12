"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AddMatchModalProps } from '@app-types/shared-type';

export default function AddMatchModal({isOpen, onClose, onSubmit, initialData, title, submitText}: AddMatchModalProps) { 
  const [formData, setFormData] = useState({
    teamA: "",
    teamB: "",
    date: "",
    time: "",
  });
  const isEditMode = !!initialData;
  
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

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !formData.teamA ||
      !formData.teamB ||
      !formData.date ||
      !formData.time
    ) {
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">{title || (isEditMode ? 'Edit Match' : 'Add New Match')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Team A */}
            <select
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
              value={formData.teamA}
              onChange={(e) =>
                setFormData({ ...formData, teamA: e.target.value })
              }
            >
              <option value="">Select Team A</option>
              <option value="team1">Single Aunty</option>
              <option value="team2">Double Trouble</option>
            </select>

            {/* Team B */}
            <select
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
              value={formData.teamB}
              onChange={(e) =>
                setFormData({ ...formData, teamB: e.target.value })
              }
            >
              <option value="">Select Team B</option>
              <option value="team3">Bros United</option>
              <option value="team4">Aunti Jaram</option>
            </select>

            {/* Date & Time */}
            <div className="flex gap-3">
              <input
                type="date"
                required
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
              <input
                type="time"
                required
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0e7490]"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-[#0e7490] rounded-md hover:bg-[#0c6380] transition"
            >
              {submitText || (isEditMode ? 'Update Match' : 'Add Match')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
