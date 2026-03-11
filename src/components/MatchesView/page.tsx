import { Pause, Pencil, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { matches } from "../../data/matchMockData";
import { MatchCard } from "@shared-component/MatchCard";
import AddMatchModal from "@shared-component/modals/WebModals/AddMatchModal";
import { UpdateScoreModal } from "@shared-component/modals/WebModals/UpdateScoreModal";
import { ConfirmModal } from "@shared-component/modals/ConfirmationModal/ConfirmModal";
import { useAuthStore } from "@/store/authStore";

export function MatchesView() {
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [showUpdateScoreModal, setShowUpdateScoreModal] = useState(false);
  const user = useAuthStore((response) => response.user);
  const isSuperAdmin = user?.role === "super_admin";

  const [confirmState, setConfirmState] = useState<{
    type: "end" | "delete" | null;
    match: any | null;
  }>({
    type: null,
    match: null,
  });

  const liveMatches = matches.filter((m) => m.status === "live");
  const upcomingMatches = matches.filter((m) => m.status === "upcoming");
  const finishedMatches = matches.filter((m) => m.status === "finished");

  return (
    <div className="min-h-screen flex-1 p-6">
      {/* Live Now Section */}
      <div className="hidden md:block mb-4">
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <h2 className="text-lg f  ont-semibold text-black">Live Now</h2>
            </div>
            {isSuperAdmin && (
              <button
                onClick={() => {
                  setSelectedMatch(null);
                  setIsMatchModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#0e7490] text-white rounded-md hover:bg-[#0c6380] transition-colors text-sm"
              >
                <Plus size={16} />
                <span>Add Match</span>
              </button>
            )}
          </div>
        </div>

        {liveMatches.length > 0 ? (
          <div className="space-y-4 mt-4">
            {liveMatches.map((match) => (
              <div
                key={match.id}
                className="relative bg-[#F8F9FA] rounded-lg shadow-sm"
              >
                {isSuperAdmin && (
                  <div className=" flex justify-end items-center gap-2 px-6 py-3 rounded-tr-lg">
                    <button
                      onClick={() => setShowUpdateScoreModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0e7490] bg-[#e0f2f7] hover:bg-[#cce9f0] rounded-md transition-colors"
                    >
                      <RefreshCw size={14} />
                      <span>Update Score</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMatch(match);
                        setIsMatchModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0e7490] bg-[#e0f2f7] hover:bg-[#cce9f0] rounded-md transition-colors"
                    >
                      <Pencil size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setConfirmState({ type: "end", match })}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#0e7490] bg-[#e0f2f7] hover:bg-[#cce9f0] rounded-md transition-colors"
                    >
                      <Pause size={14} />
                      <span>End Match</span>
                    </button>
                  </div>
                )}
                <MatchCard match={match} showActions={isSuperAdmin} variant="live" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8  text-gray-500">No live matches</div>
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
              showActions={isSuperAdmin}
              onEdit={() => {
                setSelectedMatch(match);
                setIsMatchModalOpen(true);
              }}
              onDelete={() => setConfirmState({ type: "delete", match })}
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
            <MatchCard key={match.id} match={match} variant="result" />
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddMatchModal
        isOpen={isMatchModalOpen}
        onClose={() => {
          setIsMatchModalOpen(false);
          setSelectedMatch(null);
        }}
        onSubmit={(data) => {
          if (selectedMatch) {
            // Update match
            console.log("Update match:", data);
          } else {
            // Add match
            console.log("Add match:", data);
          }
          setIsMatchModalOpen(false);
          setSelectedMatch(null);
        }}
        initialData={selectedMatch}
        title={
          selectedMatch?.status === "upcoming"
            ? "Edit Upcoming Match"
            : selectedMatch
              ? "Edit Match"
              : "Add New Match"
        }
        submitText={
          selectedMatch?.status === "upcoming"
            ? "Change"
            : selectedMatch
              ? "Update Match"
              : "Add Match"
        }
      />

      <UpdateScoreModal
        isOpen={showUpdateScoreModal}
        onClose={() => setShowUpdateScoreModal(false)}
        onUpdate={(data) => console.log("Update score:", data)}
      />

      <ConfirmModal
        isOpen={!!confirmState.type}
        onClose={() => setConfirmState({ type: null, match: null })}
        onConfirm={() => {
          if (confirmState.type === "end") {
            console.log("End match:", confirmState.match);
          }

          if (confirmState.type === "delete") {
            console.log("Delete match:", confirmState.match);
          }

          setConfirmState({ type: null, match: null });
        }}
        title={confirmState.type === "end" ? "End Match?" : "Delete Match?"}
        message={
          confirmState.type === "end"
            ? "Are you sure you want to end this match?"
            : "Are you sure you want to delete this match?"
        }
        confirmText={confirmState.type === "end" ? "End" : "Delete"}
        confirmVariant={confirmState.type === "delete" ? "danger" : "primary"}
      />
    </div>
  );
}
