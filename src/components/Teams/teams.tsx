"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTeams } from "@/hooks/useTeams"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreVertical,
  ChevronRight,
  SquarePen,
  Trash2,
} from "lucide-react"
import { TeamFormDialog } from "./modals/TeamFormDialog"
import { DeleteTeamDialog } from "./modals/DeleteTeamDialog"
import { AddMemberDialog } from "./modals/AddMemberDialog"
import { TransferDialog } from "./modals/TransferDialog"
import { TeamsSidebar } from "./TeamsSidebar"
import { TeamMembersPanel } from "./TeamMembersPanel"
import {
  createTeam,
  updateTeam,
  deleteTeam,
  createPlayer,
  deletePlayer,
  transferPlayer,
  uploadMedia,
} from "@/lib/teams-api"
import type { PayloadTeam } from "@/lib/matches-api"
import type { PayloadPlayer } from "@/lib/teams-api"
import type { Team, TeamMember } from "./types"

/** Convert API data to component types */
function toTeamView(
  team: PayloadTeam,
  players: PayloadPlayer[],
): Team {
  const teamPlayers = players.filter((p) => {
    const pTeamId = typeof p.team === "string" ? p.team : p.team?.id
    return pTeamId === team.id
  })
  return {
    id: team.id,
    name: team.name,
    icon: team.logo || "",
    playerCount: teamPlayers.length,
    members: teamPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar || undefined,
      appearances: 0,
      goals: 0,
      assists: 0,
    })),
  }
}

export default function Teams() {
  const isMobile = useIsMobile()
  const { teams: rawTeams, players, isLoading } = useTeams()
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")

  const teams = rawTeams.map((t) => toTeamView(t, players))

  // Auto-select first team if none selected
  const effectiveSelectedId = selectedTeamId || teams[0]?.id || ""
  const selectedTeam = teams.find((t) => t.id === effectiveSelectedId) || teams[0]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading teams...</p>
      </div>
    )
  }

  if (isMobile) {
    return <MobileTeamsView teams={teams} players={players} />
  }

  return (
    <DesktopTeamsView
      teams={teams}
      selectedTeamId={effectiveSelectedId}
      onSelectTeam={setSelectedTeamId}
      selectedTeam={selectedTeam}
    />
  )
}

// Desktop View Component
function DesktopTeamsView({
  teams,
  selectedTeamId,
  onSelectTeam,
  selectedTeam,
}: {
  readonly teams: Team[]
  readonly selectedTeamId: string
  readonly onSelectTeam: (id: string) => void
  readonly selectedTeam: Team
}) {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const canAddTeam = useAuthStore((s) => s.canAddTeam)
  const isSuperAdmin = user?.role === "super_admin"
  const hasTeamPermission = canAddTeam()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addTeamDialogOpen, setAddTeamDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [memberToTransfer, setMemberToTransfer] = useState<TeamMember | null>(null)
  const [playerStats, setPlayerStats] = useState({
    appearances: 0,
    goals: 0,
    assists: 0,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["teams"] })
    queryClient.invalidateQueries({ queryKey: ["players"] })
  }

  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string; file: File | null }) => {
      let logo: string | undefined
      if (data.file) {
        logo = await uploadMedia(data.file)
      }
      return createTeam({ name: data.name, logo })
    },
    onSuccess: () => {
      invalidate()
      toast.success("Team created.")
      setAddTeamDialogOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, name, file }: { id: string; name: string; file: File | null }) => {
      let logo: string | undefined
      if (file) {
        logo = await uploadMedia(file)
      }
      return updateTeam(id, { name, ...(logo && { logo }) })
    },
    onSuccess: () => {
      invalidate()
      toast.success("Team updated.")
      setEditDialogOpen(false)
      setTeamToEdit(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      invalidate()
      toast.success("Team deleted.")
      setDeleteDialogOpen(false)
      setTeamToDelete(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const addMemberMutation = useMutation({
    mutationFn: async (data: { name: string; file: File | null; teamId: string }) => {
      let avatar: string | undefined
      if (data.file) {
        avatar = await uploadMedia(data.file)
      }
      return createPlayer({ name: data.name, avatar, team: data.teamId })
    },
    onSuccess: () => {
      invalidate()
      toast.success("Member added.")
      setAddMemberDialogOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => {
      invalidate()
      toast.success("Member removed.")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const transferMutation = useMutation({
    mutationFn: (data: { playerId: string; toTeamId: string }) =>
      transferPlayer(data.playerId, data.toTeamId),
    onSuccess: () => {
      invalidate()
      toast.success("Player transferred.")
      setTransferDialogOpen(false)
      setMemberToTransfer(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleAddTeam = () => setAddTeamDialogOpen(true)

  const handleEditTeam = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setTeamToEdit(team)
      setEditDialogOpen(true)
    }
  }

  const handleDeleteTeam = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setTeamToDelete(team)
      setDeleteDialogOpen(true)
    }
  }

  const handleTeamSubmit = (data: { name: string; file: File | null }, mode: "add" | "edit") => {
    if (mode === "edit" && teamToEdit) {
      updateTeamMutation.mutate({ id: teamToEdit.id, name: data.name, file: data.file })
    } else {
      createTeamMutation.mutate({ name: data.name, file: data.file })
    }
  }

  const handleDeleteConfirm = () => {
    if (!teamToDelete) return
    deleteTeamMutation.mutate(teamToDelete.id)
  }

  const handleAddMember = () => setAddMemberDialogOpen(true)

  const handleAddMemberSubmit = (data: { name: string; file: File | null }) => {
    addMemberMutation.mutate({ name: data.name, file: data.file, teamId: selectedTeam.id })
  }

  const handleEditMember = (memberId: string) => {
    const member = selectedTeam.members.find((m) => m.id === memberId)
    if (member) {
      setEditingMemberId(memberId)
      setPlayerStats({
        appearances: member.appearances,
        goals: member.goals,
        assists: member.assists,
      })
    }
  }

  const handleSaveMember = (memberId: string, stats: { appearances: number; goals: number; assists: number }) => {
    setEditingMemberId(null)
    setPlayerStats({ appearances: 0, goals: 0, assists: 0 })
  }

  const handleCancelEdit = () => {
    setEditingMemberId(null)
    setPlayerStats({ appearances: 0, goals: 0, assists: 0 })
  }

  const handleTransferMember = (memberId: string) => {
    const member = selectedTeam.members.find((m) => m.id === memberId)
    if (member) {
      setMemberToTransfer(member)
      setTransferDialogOpen(true)
    }
  }

  const handleTransferSubmit = (data: {
    playerId: string
    fromTeamId: string
    toTeamId: string
    stats: { appearances: number; goals: number; assists: number }
  }) => {
    transferMutation.mutate({ playerId: data.playerId, toTeamId: data.toTeamId })
  }

  const handleDeleteMember = (memberId: string) => {
    deleteMemberMutation.mutate(memberId)
  }

  return (
    <div className="p-6 min-h-screen from-[#d5e5ec] via-[#e0f2f1] to-[#c8e6d4]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Futsal Club</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        <TeamsSidebar
          teams={teams}
          selectedTeamId={selectedTeamId}
          onSelectTeam={onSelectTeam}
          onAddTeam={hasTeamPermission ? handleAddTeam : undefined}
          onEditTeam={hasTeamPermission ? handleEditTeam : undefined}
          onDeleteTeam={isSuperAdmin ? handleDeleteTeam : undefined}
        />

        {selectedTeam && (
          <TeamMembersPanel
            team={selectedTeam}
            onAddMember={hasTeamPermission ? handleAddMember : undefined}
            onEditMember={hasTeamPermission ? handleEditMember : undefined}
            onSaveMember={hasTeamPermission ? handleSaveMember : undefined}
            onCancelEdit={handleCancelEdit}
            onTransferMember={hasTeamPermission ? handleTransferMember : undefined}
            onDeleteMember={isSuperAdmin ? handleDeleteMember : undefined}
            editingMemberId={editingMemberId}
            playerStats={playerStats}
            onStatsChange={setPlayerStats}
          />
        )}
      </div>

      <TeamFormDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setTeamToEdit(null)
        }}
        onSubmit={(data) => handleTeamSubmit(data, "edit")}
        mode="edit"
        initialName={teamToEdit?.name || ""}
        existingLogoUrl={teamToEdit?.icon && (teamToEdit.icon.startsWith("/") || teamToEdit.icon.startsWith("http")) ? teamToEdit.icon : undefined}
      />

      <DeleteTeamDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setTeamToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        teamName={teamToDelete?.name}
      />

      <TeamFormDialog
        isOpen={addTeamDialogOpen}
        onClose={() => setAddTeamDialogOpen(false)}
        onSubmit={(data) => handleTeamSubmit(data, "add")}
        mode="add"
      />

      <AddMemberDialog
        isOpen={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        onSubmit={handleAddMemberSubmit}
      />

      <TransferDialog
        isOpen={transferDialogOpen}
        onClose={() => {
          setTransferDialogOpen(false)
          setMemberToTransfer(null)
        }}
        onSubmit={handleTransferSubmit}
        player={memberToTransfer}
        currentTeamId={selectedTeam?.id || ""}
        teams={teams}
      />
    </div>
  )
}

// Mobile View Component
function MobileTeamsView({
  teams,
  players,
}: {
  readonly teams: Team[]
  readonly players: PayloadPlayer[]
}) {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const canAddTeam = useAuthStore((s) => s.canAddTeam)
  const isSuperAdmin = user?.role === "super_admin"
  const hasTeamPermission = canAddTeam()

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addTeamDialogOpen, setAddTeamDialogOpen] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<Team | null>(null)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["teams"] })
    queryClient.invalidateQueries({ queryKey: ["players"] })
  }

  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string; file: File | null }) => {
      let logo: string | undefined
      if (data.file) {
        logo = await uploadMedia(data.file)
      }
      return createTeam({ name: data.name, logo })
    },
    onSuccess: () => {
      invalidate()
      toast.success("Team created.")
      setAddTeamDialogOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, name, file }: { id: string; name: string; file: File | null }) => {
      let logo: string | undefined
      if (file) {
        logo = await uploadMedia(file)
      }
      return updateTeam(id, { name, ...(logo && { logo }) })
    },
    onSuccess: () => {
      invalidate()
      toast.success("Team updated.")
      setEditDialogOpen(false)
      setTeamToEdit(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      invalidate()
      toast.success("Team deleted.")
      setDeleteDialogOpen(false)
      setTeamToDelete(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const addMemberMutation = useMutation({
    mutationFn: async (data: { name: string; file: File | null; teamId: string }) => {
      let avatar: string | undefined
      if (data.file) {
        avatar = await uploadMedia(data.file)
      }
      return createPlayer({ name: data.name, avatar, team: data.teamId })
    },
    onSuccess: () => {
      invalidate()
      toast.success("Member added.")
      setAddMemberDialogOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => {
      invalidate()
      toast.success("Member removed.")
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleAddTeam = () => setAddTeamDialogOpen(true)

  const handleEditTeam = (teamId: string) => {
    setOpenMenuId(null)
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setTeamToEdit(team)
      setEditDialogOpen(true)
    }
  }

  const handleDeleteTeam = (teamId: string) => {
    setOpenMenuId(null)
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setTeamToDelete(team)
      setDeleteDialogOpen(true)
    }
  }

  const handleTeamSubmit = (data: { name: string; file: File | null }, mode: "add" | "edit") => {
    if (mode === "edit" && teamToEdit) {
      updateTeamMutation.mutate({ id: teamToEdit.id, name: data.name, file: data.file })
    } else {
      createTeamMutation.mutate({ name: data.name, file: data.file })
    }
  }

  const handleDeleteConfirm = () => {
    if (!teamToDelete) return
    deleteTeamMutation.mutate(teamToDelete.id)
  }

  const handleTeamClick = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setSelectedTeamForMembers(selectedTeamForMembers?.id === teamId ? null : team)
    }
  }

  const handleDeleteMember = (memberId: string) => {
    deleteMemberMutation.mutate(memberId)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Team Management Section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Team Management</h2>
          {hasTeamPermission && (
            <Button
              size="icon"
              className="h-10 w-10 mt-4 rounded-full bg-teal-500 hover:bg-teal-600"
              onClick={handleAddTeam}
            >
              <Plus className="h-5 w-5 text-white" />
            </Button>
          )}
        </div>

        {/* Team Cards */}
        <div className="space-y-3">
          {teams.map((team) => (
            <DropdownMenu
              key={team.id}
              open={openMenuId === team.id}
              onOpenChange={(open) => setOpenMenuId(open ? team.id : null)}
            >
              <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="flex items-center gap-3 flex-1 cursor-pointer text-left"
                      onClick={() => handleTeamClick(team.id)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {team.icon && (team.icon.startsWith("/") || team.icon.startsWith("http")) ? (
                          <img src={team.icon} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{team.icon || team.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{team.name}</h3>
                        <p className="text-sm text-gray-500">
                          {team.playerCount} {team.playerCount === 1 ? "Player" : "Players"}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      {hasTeamPermission && (
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-5 w-5 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTeamClick(team.id)
                        }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Members Section for Mobile */}
                  {selectedTeamForMembers?.id === team.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Members</h4>
                        {hasTeamPermission && (
                          <Button
                            size="sm"
                            className="h-8 bg-[#267c93] hover:bg-[#1e6477] text-white text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setAddMemberDialogOpen(true)
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                      {team.members.length > 0 ? (
                        <div className="space-y-2">
                          {team.members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden">
                                  {member.avatar && (member.avatar.startsWith("/") || member.avatar.startsWith("http")) ? (
                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                  ) : (
                                    member.name.split(" ").map((n) => n[0]).join("").toUpperCase()
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {member.name}
                                </span>
                              </div>
                              {isSuperAdmin && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-red-500 hover:text-red-700 shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteMember(member.id)
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-2">No members yet</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {hasTeamPermission && (
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => handleEditTeam(team.id)} className="py-3">
                    <SquarePen className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {isSuperAdmin && (
                    <DropdownMenuItem
                      onClick={() => handleDeleteTeam(team.id)}
                      className="py-3 text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No teams yet. Add a team to get started.</p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <TeamFormDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setTeamToEdit(null)
        }}
        onSubmit={(data) => handleTeamSubmit(data, "edit")}
        mode="edit"
        initialName={teamToEdit?.name || ""}
        existingLogoUrl={teamToEdit?.icon && (teamToEdit.icon.startsWith("/") || teamToEdit.icon.startsWith("http")) ? teamToEdit.icon : undefined}
      />

      <DeleteTeamDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setTeamToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        teamName={teamToDelete?.name}
      />

      <TeamFormDialog
        isOpen={addTeamDialogOpen}
        onClose={() => setAddTeamDialogOpen(false)}
        onSubmit={(data) => handleTeamSubmit(data, "add")}
        mode="add"
      />

      <AddMemberDialog
        isOpen={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        onSubmit={(data) => {
          if (selectedTeamForMembers) {
            addMemberMutation.mutate({ name: data.name, file: data.file, teamId: selectedTeamForMembers.id })
          }
        }}
      />
    </div>
  )
}
