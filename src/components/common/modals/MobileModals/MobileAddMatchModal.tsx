'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { AddMatchModalProps, MatchProps } from '@app-types/shared-type';
import { getTeams, createMatch, updateMatch } from '@/lib/matches-api';

type FormValues = MatchProps;

export function MobileAddMatchModal({ isOpen, onClose, onSubmit, initialData, title, submitText }: AddMatchModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      onSubmit({
        id: data.id,
        teamA: typeof data.teamA === 'object' ? data.teamA.id : data.teamA,
        teamB: typeof data.teamB === 'object' ? data.teamB.id : data.teamB,
        date: data.date,
        time: data.time,
      });
      onClose();
      toast.success('Match added.');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateMatch>[1] }) =>
      updateMatch(id, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      onSubmit({
        id: data.id,
        teamA: typeof data.teamA === 'object' ? data.teamA.id : data.teamA,
        teamB: typeof data.teamB === 'object' ? data.teamB.id : data.teamB,
        date: data.date,
        time: data.time,
      });
      onClose();
      toast.success('Match updated.');
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { teamA: '', teamB: '', date: '', time: '' },
  });

  useEffect(() => {
    if (initialData) {
      const teamAId =
        typeof initialData.teamA === 'string'
          ? initialData.teamA
          : (initialData.teamA as { id?: string })?.id ?? '';
      const teamBId =
        typeof initialData.teamB === 'string'
          ? initialData.teamB
          : (initialData.teamB as { id?: string })?.id ?? '';
      reset({
        ...(initialData.id && { id: initialData.id }),
        teamA: teamAId,
        teamB: teamBId,
        date: initialData.date || '',
        time: initialData.time || '',
      });
    } else {
      reset({ teamA: '', teamB: '', date: '', time: '' });
    }
  }, [initialData, reset]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const onFormSubmit = (data: FormValues) => {
    if (!data.teamA) {
      setError('teamA', { type: 'required', message: 'Select Team A' });
      return;
    }
    if (!data.teamB) {
      setError('teamB', { type: 'required', message: 'Select Team B' });
      return;
    }
    if (isEditMode && initialData?.id) {
      updateMutation.mutate({
        id: initialData.id,
        body: {
          teamA: data.teamA,
          teamB: data.teamB,
          date: data.date,
          time: data.time,
        },
      });
    } else {
      createMutation.mutate({
        teamA: data.teamA,
        teamB: data.teamB,
        date: data.date,
        time: data.time,
        status: 'upcoming',
        scoreA: 0,
        scoreB: 0,
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const selectClass =
    'w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0e7490] appearance-none';
  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0e7490]';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center md:justify-center z-9999">
      <div className="bg-white rounded-t-2xl md:rounded-lg w-full md:max-w-sm">
        <div className="flex items-center justify-center pt-2 pb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold text-center mb-6">
            {title || (isEditMode ? 'Edit Match' : 'Add New Match')}
          </h2>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="relative">
              <select
                {...register('teamA', { required: 'Select Team A' })}
                disabled={teamsLoading}
                className={selectClass}
              >
                <option value="">
                  {teamsLoading ? 'Loading…' : 'Select Team A'}
                </option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.logo ? `${t.logo} ` : ''}{t.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              {errors.teamA && (
                <p className="text-sm text-red-600 mt-1">{errors.teamA.message}</p>
              )}
            </div>

            <div className="relative">
              <select
                {...register('teamB', { required: 'Select Team B' })}
                disabled={teamsLoading}
                className={selectClass}
              >
                <option value="">
                  {teamsLoading ? 'Loading…' : 'Select Team B'}
                </option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.logo ? `${t.logo} ` : ''}{t.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              {errors.teamB && (
                <p className="text-sm text-red-600 mt-1">{errors.teamB.message}</p>
              )}
              {!teamsLoading && teams.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  No teams in database. Run: npm run seed:teams
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  className={inputClass}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                {errors.date && (
                  <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type="time"
                  {...register('time', { required: 'Time is required' })}
                  className={inputClass}
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                {errors.time && (
                  <p className="text-sm text-red-600 mt-1">{errors.time.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 text-sm text-[#0e7490] border border-[#0e7490] rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || teamsLoading}
                className="flex-1 px-6 py-3 text-sm text-white bg-[#0e7490] rounded-md hover:bg-[#0c6380] transition-colors disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving…'
                  : submitText || (isEditMode ? 'Update Match' : 'Add Match')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
