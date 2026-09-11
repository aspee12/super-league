"use client"

import { useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTeams } from "@/hooks/useTeams"
import { useMatches } from "@/hooks/useMatches"
import { useSeasons } from "@/hooks/useSeasons"
import { useAuthStore } from "@/store/authStore"
import { FullPageLoader } from "@shared-component/FullPageLoader"
import { ArchiveSeasonNotice, SeasonFilter } from "@shared-component/SeasonFilter"
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
import { ConfirmModal } from "@shared-component/modals/ConfirmationModal/ConfirmModal"
import { TeamFormDialog } from "./modals/TeamFormDialog"
import { DeleteTeamDialog } from "./modals/DeleteTeamDialog"
import { AddMemberDialog } from "./modals/AddMemberDialog"
import { EditMemberDialog } from "./modals/EditMemberDialog"
import { TransferDialog } from "./modals/TransferDialog"
import { TeamsSidebar } from "./TeamsSidebar"
import { TeamMembersPanel } from "./TeamMembersPanel"
import { GoalkeeperBadge } from "@shared-component/GoalkeeperBadge"
import {
  createTeam,
  updateTeam,
  deleteTeam,
  createPlayer,
  updatePlayer,
  deletePlayer,
  transferPlayer,
  uploadMedia,
} from "@/lib/teams-api"
import { updatePlayerNameInMatches } from "@/lib/matches-api"
import type { PayloadTeam } from "@/lib/matches-api"
import type { PayloadPlayer } from "@/lib/teams-api"
import type { Match } from "@/types/matchTypes"
import type { Team, TeamMember } from "./types"

/** Build a map of playerName-teamName -> { goals, assists, cleanSheets } from all matches */
function buildPlayerStatsMap(matches: Match[], goalkeeperNames: Set<string>) {
  const map = new Map<string, { goals: number; assists: number; cleanSheets: number }>()
  const relevant = matches.filter((m) => m.status === "finished" || m.status === "live")
  for (const match of relevant) {
    if (!match.playerStats) continue
    for (const ps of match.playerStats) {
      const teamObj = ps.team === "teamA" ? match.teamA : match.teamB
      const teamName = teamObj.name

      // Credit goals to the scorer
      if (ps.goals > 0) {
        const key = `${ps.playerName}-${teamName}`
        const existing = map.get(key)
        if (existing) {
          existing.goals += ps.goals
        } else {
          map.set(key, { goals: ps.goals, assists: 0, cleanSheets: 0 })
        }
      }

      // Credit assists to the actual assister, not the scorer
      if (ps.assists > 0 && ps.assistName) {
        const assistKey = `${ps.assistName}-${teamName}`
        const existing = map.get(assistKey)
        if (existing) {
          existing.assists += ps.assists
        } else {
          map.set(assistKey, { goals: 0, assists: ps.assists, cleanSheets: 0 })
        }
      }
    }
  }

  // Compute clean sheets for goalkeepers from finished matches
  const finished = matches.filter((m) => m.status === "finished")
  for (const match of finished) {
    // Team A kept clean sheet if scoreB === 0
    if (match.scoreB === 0) {
      for (const gkName of goalkeeperNames) {
        const key = `${gkName}-${match.teamA.name}`
        const existing = map.get(key)
        if (existing) existing.cleanSheets += 1
        else map.set(key, { goals: 0, assists: 0, cleanSheets: 1 })
      }
    }
    // Team B kept clean sheet if scoreA === 0
    if (match.scoreA === 0) {
      for (const gkName of goalkeeperNames) {
        const key = `${gkName}-${match.teamB.name}`
        const existing = map.get(key)
        if (existing) existing.cleanSheets += 1
        else map.set(key, { goals: 0, assists: 0, cleanSheets: 1 })
      }
    }
  }

  return map
}

/**
 * Convert API data to component types.
 *
 * Takes the team's players directly rather than filtering the league-wide list
 * per team, which made the caller O(teams × players).
 */
function toTeamView(
  team: PayloadTeam,
  teamPlayers: PayloadPlayer[],
  statsMap: Map<string, { goals: number; assists: number; cleanSheets: number }>,
): Team {
  return {
    id: team.id,
    name: team.name,
    icon: team.logo || "",
    playerCount: teamPlayers.length,
    members: teamPlayers
      .map((p) => {
        const stats = statsMap.get(`${p.name}-${team.name}`) || { goals: 0, assists: 0, cleanSheets: 0 }
        return {
          id: p.id,
          name: p.name,
          avatar: p.avatar || undefined,
          isGoalkeeper: p.isGoalkeeper || false,
          goals: stats.goals,
          assists: stats.assists,
          cleanSheets: stats.cleanSheets,
        }
      })
      // A–Z by name so the roster is scannable regardless of the order the API
      // returns. Sorting here covers every consumer of `Team.members`.
      // `sensitivity: 'base'` keeps casing from splitting the alphabet.
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }),
      ),
  }
}

export default function Teams() {
  const isMobile = useIsMobile()
  const { teams: rawTeams, players, isLoading } = useTeams()
  const { matches } = useMatches()
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")

  // This component holds a dozen useState hooks, and the aggregation below
  // walks every match × every player stat. Unmemoized it re-ran on every
  // keystroke and every dropdown toggle — and again on each 15s live-match
  // poll — which is what made the Teams page feel sluggish.
  const goalkeeperNames = useMemo(
    () => new Set(players.filter((p) => p.isGoalkeeper).map((p) => p.name)),
    [players],
  )

  const statsMap = useMemo(
    () => buildPlayerStatsMap(matches, goalkeeperNames),
    [matches, goalkeeperNames],
  )

  // Group players by team once instead of rescanning the full list per team.
  const playersByTeamId = useMemo(() => {
    const map = new Map<string, PayloadPlayer[]>()
    for (const p of players) {
      const id = typeof p.team === "string" ? p.team : p.team?.id
      if (!id) continue
      const list = map.get(id)
      if (list) list.push(p)
      else map.set(id, [p])
    }
    return map
  }, [players])

  // `useTeams` already scopes both clubs and squads to the season on show, so
  // this is that season's league, not the all-time list.
  const teams = useMemo(
    () => rawTeams.map((t) => toTeamView(t, playersByTeamId.get(t.id) ?? [], statsMap)),
    [rawTeams, playersByTeamId, statsMap],
  )

  // Auto-select first team if none selected
  const effectiveSelectedId = selectedTeamId || teams[0]?.id || ""
  const selectedTeam = teams.find((t) => t.id === effectiveSelectedId) || teams[0]

  if (isLoading) {
    return <FullPageLoader message="Loading teams..." />
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
  const { viewingSeasonId, isViewingActiveSeason } = useSeasons()
  // A finished season is a record, not a working document. Editing it would
  // rewrite history — which is how last season's squads were lost in the first
  // place — so the write actions are withheld unless the live season is on show.
  const isSuperAdmin = user?.role === "super_admin" && isViewingActiveSeason
  const hasTeamPermission = canAddTeam() && isViewingActiveSeason

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addTeamDialogOpen, setAddTeamDialogOpen] = useState(false)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false)
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null)
  const [memberToTransfer, setMemberToTransfer] = useState<TeamMember | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["teams"] })
    queryClient.invalidateQueries({ queryKey: ["players"] })
  }

  const editMemberMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; oldName: string; file: File | null; isGoalkeeper: boolean }) => {
      let avatar: string | undefined
      if (data.file) {
        avatar = await uploadMedia(data.file)
      }
      const result = await updatePlayer(data.id, { name: data.name, isGoalkeeper: data.isGoalkeeper, ...(avatar && { avatar }) })
      if (data.oldName !== data.name) {
        await updatePlayerNameInMatches(data.oldName, data.name)
      }
      return result
    },
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ["matches"] })
      toast.success("Member updated.")
      setEditMemberDialogOpen(false)
      setMemberToEdit(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string; file: File | null }) => {
      let logo: string | undefined
      if (data.file) {
        logo = await uploadMedia(data.file)
      }
      return createTeam({ name: data.name, logo, seasons: viewingSeasonId ? [viewingSeasonId] : undefined })
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
      return createPlayer({ name: data.name, avatar, team: data.teamId, season: viewingSeasonId })
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
      setMemberToDelete(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setMemberToDelete(null)
    },
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
      setMemberToEdit(member)
      setEditMemberDialogOpen(true)
    }
  }

  const handleEditMemberSubmit = (data: { name: string; file: File | null; isGoalkeeper: boolean }) => {
    if (!memberToEdit) return
    editMemberMutation.mutate({ id: memberToEdit.id, name: data.name, oldName: memberToEdit.name, file: data.file, isGoalkeeper: data.isGoalkeeper })
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
    stats: { goals: number; assists: number }
  }) => {
    transferMutation.mutate({ playerId: data.playerId, toTeamId: data.toTeamId })
  }

  const handleDeleteMember = (memberId: string) => {
    const member = selectedTeam.members.find((m) => m.id === memberId)
    if (member) setMemberToDelete(member)
  }

  const handleDeleteMemberConfirm = () => {
    if (!memberToDelete) return
    deleteMemberMutation.mutate(memberToDelete.id)
  }

  return (
    <div className="p-6 min-h-screen from-[#d5e5ec] via-[#e0f2f1] to-[#c8e6d4]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Futsal Club</h1>
        <SeasonFilter showReset={false} />
      </div>
      <ArchiveSeasonNotice />

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
            onTransferMember={hasTeamPermission ? handleTransferMember : undefined}
            onDeleteMember={isSuperAdmin ? handleDeleteMember : undefined}
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

      <ConfirmModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDeleteMemberConfirm}
        title="Remove member"
        message={`Are you sure you want to remove ${memberToDelete?.name ?? "this member"} from ${selectedTeam?.name ?? "the team"}? This will also delete their photo and cannot be undone.`}
        confirmText="Remove"
        confirmVariant="danger"
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

      <EditMemberDialog
        isOpen={editMemberDialogOpen}
        onClose={() => {
          setEditMemberDialogOpen(false)
          setMemberToEdit(null)
        }}
        onSubmit={handleEditMemberSubmit}
        initialName={memberToEdit?.name || ""}
        initialIsGoalkeeper={memberToEdit?.isGoalkeeper || false}
        existingAvatarUrl={memberToEdit?.avatar && (memberToEdit.avatar.startsWith("/") || memberToEdit.avatar.startsWith("http")) ? memberToEdit.avatar : undefined}
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
  const { viewingSeasonId, isViewingActiveSeason } = useSeasons()
  // Archived seasons are read-only — see the note in DesktopTeamsView.
  const isSuperAdmin = user?.role === "super_admin" && isViewingActiveSeason
  const hasTeamPermission = canAddTeam() && isViewingActiveSeason

  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addTeamDialogOpen, setAddTeamDialogOpen] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<Team | null>(null)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false)
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null)
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["teams"] })
    queryClient.invalidateQueries({ queryKey: ["players"] })
  }

  const editMemberMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; oldName: string; file: File | null; isGoalkeeper: boolean }) => {
      let avatar: string | undefined
      if (data.file) {
        avatar = await uploadMedia(data.file)
      }
      const result = await updatePlayer(data.id, { name: data.name, isGoalkeeper: data.isGoalkeeper, ...(avatar && { avatar }) })
      if (data.oldName !== data.name) {
        await updatePlayerNameInMatches(data.oldName, data.name)
      }
      return result
    },
    onSuccess: () => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ["matches"] })
      toast.success("Member updated.")
      setEditMemberDialogOpen(false)
      setMemberToEdit(null)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string; file: File | null }) => {
      let logo: string | undefined
      if (data.file) {
        logo = await uploadMedia(data.file)
      }
      return createTeam({ name: data.name, logo, seasons: viewingSeasonId ? [viewingSeasonId] : undefined })
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
      return createPlayer({ name: data.name, avatar, team: data.teamId, season: viewingSeasonId })
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
      setMemberToDelete(null)
    },
    onError: (err: Error) => {
      toast.error(err.message)
      setMemberToDelete(null)
    },
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

  const handleEditMember = (member: TeamMember) => {
    setMemberToEdit(member)
    setEditMemberDialogOpen(true)
  }

  const handleEditMemberSubmit = (data: { name: string; file: File | null; isGoalkeeper: boolean }) => {
    if (!memberToEdit) return
    editMemberMutation.mutate({ id: memberToEdit.id, name: data.name, oldName: memberToEdit.name, file: data.file, isGoalkeeper: data.isGoalkeeper })
  }

  const handleTeamClick = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId)
    if (team) {
      setSelectedTeamForMembers(selectedTeamForMembers?.id === teamId ? null : team)
    }
  }

  const handleDeleteMember = (member: TeamMember) => {
    setMemberToDelete(member)
  }

  const handleDeleteMemberConfirm = () => {
    if (!memberToDelete) return
    deleteMemberMutation.mutate(memberToDelete.id)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Team Management Section */}
      <div className="px-4">
        <div className="pt-4 mb-3">
          <SeasonFilter showReset={false} />
          <div className="mt-3">
            <ArchiveSeasonNotice />
          </div>
        </div>
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
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden">
                                  {member.avatar && (member.avatar.startsWith("/") || member.avatar.startsWith("http")) ? (
                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                  ) : (
                                    member.name.split(" ").map((n) => n[0]).join("").toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-medium text-gray-900 truncate">
                                      {member.name}
                                    </span>
                                    {member.isGoalkeeper && (
                                      <GoalkeeperBadge size="sm" />
                                    )}
                                  </div>
                                  <div className="flex gap-3 text-[11px] text-gray-500">
                                    <span>G: <span className="font-semibold text-gray-700">{member.goals}</span></span>
                                    <span>A: <span className="font-semibold text-gray-700">{member.assists}</span></span>
                                    {member.isGoalkeeper && (
                                      <span>CS: <span className="font-semibold text-gray-700">{member.cleanSheets}</span></span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {hasTeamPermission && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-gray-500 hover:text-gray-700"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditMember(member)
                                    }}
                                  >
                                    <SquarePen className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {isSuperAdmin && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-red-500 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteMember(member)
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                                )}
                              </div>
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

      <ConfirmModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDeleteMemberConfirm}
        title="Remove member"
        message={`Are you sure you want to remove ${memberToDelete?.name ?? "this member"}? This will also delete their photo and cannot be undone.`}
        confirmText="Remove"
        confirmVariant="danger"
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

      <EditMemberDialog
        isOpen={editMemberDialogOpen}
        onClose={() => {
          setEditMemberDialogOpen(false)
          setMemberToEdit(null)
        }}
        onSubmit={handleEditMemberSubmit}
        initialName={memberToEdit?.name || ""}
        initialIsGoalkeeper={memberToEdit?.isGoalkeeper || false}
        existingAvatarUrl={memberToEdit?.avatar && (memberToEdit.avatar.startsWith("/") || memberToEdit.avatar.startsWith("http")) ? memberToEdit.avatar : undefined}
      />
    </div>
  )
}
