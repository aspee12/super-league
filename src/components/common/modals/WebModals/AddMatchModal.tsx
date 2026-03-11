"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";
import { AddMatchModalProps, MatchProps } from "@app-types/shared-type";
import { Input } from "@ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/Select";
import { getTeams, createMatch, updateMatch } from "@/lib/matches-api";

type FormValues = MatchProps;

export default function AddMatchModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  submitText,
}: AddMatchModalProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: createMatch,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      onSubmit({
        id: data.id,
        teamA: typeof data.teamA === "object" ? data.teamA.id : data.teamA,
        teamB: typeof data.teamB === "object" ? data.teamB.id : data.teamB,
        date: data.date,
        time: data.time,
      });
      onClose();
      toast.success("Match added.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof updateMatch>[1] }) =>
      updateMatch(id, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      onSubmit({
        id: data.id,
        teamA: typeof data.teamA === "object" ? data.teamA.id : data.teamA,
        teamB: typeof data.teamB === "object" ? data.teamB.id : data.teamB,
        date: data.date,
        time: data.time,
      });
      onClose();
      toast.success("Match updated.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      teamA: "",
      teamB: "",
      date: "",
      time: "",
    },
  });

  const teamA = watch("teamA");
  const teamB = watch("teamB");

  useEffect(() => {
    if (initialData) {
      const teamAId =
        typeof initialData.teamA === "string"
          ? initialData.teamA
          : (initialData.teamA as { id?: string })?.id ?? "";
      const teamBId =
        typeof initialData.teamB === "string"
          ? initialData.teamB
          : (initialData.teamB as { id?: string })?.id ?? "";
      reset({
        ...(initialData.id && { id: initialData.id }),
        teamA: teamAId,
        teamB: teamBId,
        date: initialData.date || "",
        time: initialData.time || "",
      });
    } else {
      reset({
        teamA: "",
        teamB: "",
        date: "",
        time: "",
      });
    }
  }, [initialData, reset]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const onFormSubmit = (data: FormValues) => {
    if (!data.teamA) {
      setError("teamA", { type: "required", message: "Select Team A" });
      return;
    }
    if (!data.teamB) {
      setError("teamB", { type: "required", message: "Select Team B" });
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
        status: "upcoming",
        scoreA: 0,
        scoreB: 0,
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {title ?? (isEditMode ? "Edit Match" : "Add New Match")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="space-y-4">
            {/* Team A */}
            <div>
              <label className="sr-only" htmlFor="teamA">Team A</label>
              <Select
                value={teamA}
                onValueChange={(value) => setValue("teamA", value, { shouldValidate: true })}
                disabled={teamsLoading}
              >
                <SelectTrigger
                  id="teamA"
                  className="w-full"
                  aria-invalid={!!errors.teamA}
                >
                  <SelectValue placeholder={teamsLoading ? "Loading…" : "Select Team A"} />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.logo ? `${t.logo} ` : ""}{t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teamA && (
                <p className="text-sm text-red-600 mt-1">{errors.teamA.message}</p>
              )}
            </div>

            {/* Team B */}
            <div>
              <label className="sr-only" htmlFor="teamB">Team B</label>
              <Select
                value={teamB}
                onValueChange={(value) => setValue("teamB", value, { shouldValidate: true })}
                disabled={teamsLoading}
              >
                <SelectTrigger
                  id="teamB"
                  className="w-full"
                  aria-invalid={!!errors.teamB}
                >
                  <SelectValue placeholder={teamsLoading ? "Loading…" : "Select Team B"} />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.logo ? `${t.logo} ` : ""}{t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teamB && (
                <p className="text-sm text-red-600 mt-1">{errors.teamB.message}</p>
              )}
              {!teamsLoading && teams.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  No teams in database. Run: npm run seed:teams
                </p>
              )}
            </div>

            {/* Date & Time */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="sr-only" htmlFor="date">Date</label>
                <Input
                  id="date"
                  type="date"
                  {...register("date", { required: "Date is required" })}
                  aria-invalid={!!errors.date}
                />
                {errors.date && (
                  <p className="text-sm text-red-600 mt-1">{errors.date.message}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="sr-only" htmlFor="time">Time</label>
                <Input
                  id="time"
                  type="time"
                  {...register("time", { required: "Time is required" })}
                  aria-invalid={!!errors.time}
                />
                {errors.time && (
                  <p className="text-sm text-red-600 mt-1">{errors.time.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || teamsLoading}
              className="px-4 py-2 text-sm text-white bg-[#0e7490] rounded-md hover:bg-[#0c6380] transition disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving…"
                : submitText ?? (isEditMode ? "Update Match" : "Add Match")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
