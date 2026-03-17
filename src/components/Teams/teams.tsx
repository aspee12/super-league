"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
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
import type { Team, TeamMember } from "./types"

// Mock data - Replace with actual data fetching
const mockTeams: Team[] = [
  {
    id: "1",
    name: "Read Dragon",
    icon: "🐉",
    playerCount: 12,
    members: [
      {
        id: "1",
        name: "Tashi Dorji",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
        appearances: 10,
        goals: 5,
        assists: 3,
      },
      {
        id: "2",
        name: "Lhamo Tshering",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        appearances: 8,
        goals: 3,
        assists: 2,
      },
      {
        id: "3",
        name: "Karma Wangchuk",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        appearances: 12,
        goals: 7,
        assists: 4,
      },
    ],
  },
  {
    id: "2",
    name: "Blue kak",
    icon: "🔵",
    playerCount: 15,
    members: [
      {
        id: "4",
        name: "Sonam Tashi",
        appearances: 9,
        goals: 4,
        assists: 2,
      },
    ],
  },
  {
    id: "3",
    name: "Green tea",
    icon: "🟢",
    playerCount: 10,
    members: [
      {
        id: "5",
        name: "Pema Dorji",
        appearances: 7,
        goals: 2,
        assists: 1,
      },
    ],
  },
  {
    id: "4",
    name: "Red apple",
    icon: "🔴",
    playerCount: 20,
    members: [
      {
        id: "6",
        name: "Tenzin Wangmo",
        appearances: 11,
        goals: 6,
        assists: 3,
      },
    ],
  },
]

export default function Teams() {
  const isMobile = useIsMobile()
  const [selectedTeamId, setSelectedTeamId] = useState<string>("1")

  const selectedTeam = mockTeams.find((team) => team.id === selectedTeamId) || mockTeams[0]

  if (isMobile) {
    return <MobileTeamsView teams={mockTeams} />
  }

  return <DesktopTeamsView teams={mockTeams} selectedTeamId={selectedTeamId} onSelectTeam={setSelectedTeamId} selectedTeam={selectedTeam} />
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

  const handleAddTeam = () => {
    setAddTeamDialogOpen(true)
  }

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
      // TODO: Implement API call to update team
      console.log("Update team:", {
        id: teamToEdit.id,
        name: data.name,
        file: data.file,
      })
      setEditDialogOpen(false)
      setTeamToEdit(null)
    } else {
      // TODO: Implement API call to create team
      console.log("Add team:", {
        name: data.name,
        file: data.file,
      })
      setAddTeamDialogOpen(false)
    }
  }

  const handleDeleteConfirm = () => {
    if (!teamToDelete) return
    
    // TODO: Implement API call to delete team
    console.log("Delete team:", teamToDelete.id)
    
    setDeleteDialogOpen(false)
    setTeamToDelete(null)
  }

  const handleAddMember = () => {
    setAddMemberDialogOpen(true)
  }

  const handleAddMemberSubmit = (data: { name: string; file: File | null }) => {
    // TODO: Implement API call to add member
    console.log("Add member:", {
      name: data.name,
      picture: data.file,
      teamId: selectedTeam.id,
    })
    setAddMemberDialogOpen(false)
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
    // TODO: Implement API call to update member stats
    console.log("Update member:", {
      id: memberId,
      stats,
    })
    
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
    // TODO: Implement API call to transfer member
    console.log("Transfer member:", data)
    setTransferDialogOpen(false)
    setMemberToTransfer(null)
  }

  const handleDeleteMember = (memberId: string) => {
    // TODO: Implement delete member functionality
    console.log("Delete member", memberId)
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#d5e5ec] via-[#e0f2f1] to-[#c8e6d4]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Futsal Club</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        {/* Left Panel - Teams Sidebar */}
        <TeamsSidebar
          teams={teams}
          selectedTeamId={selectedTeamId}
          onSelectTeam={onSelectTeam}
          onAddTeam={handleAddTeam}
          onEditTeam={handleEditTeam}
          onDeleteTeam={handleDeleteTeam}
        />

        {/* Right Panel - Team Members */}
        <TeamMembersPanel
          team={selectedTeam}
          onAddMember={handleAddMember}
          onEditMember={handleEditMember}
          onSaveMember={handleSaveMember}
          onCancelEdit={handleCancelEdit}
          onTransferMember={handleTransferMember}
          onDeleteMember={handleDeleteMember}
          editingMemberId={editingMemberId}
          playerStats={playerStats}
          onStatsChange={setPlayerStats}
        />
      </div>

      {/* Edit Team Dialog */}
      <TeamFormDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setTeamToEdit(null)
        }}
        onSubmit={(data) => handleTeamSubmit(data, "edit")}
        mode="edit"
        initialName={teamToEdit?.name || ""}
      />

      {/* Delete Team Dialog */}
      <DeleteTeamDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setTeamToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        teamName={teamToDelete?.name}
      />

      {/* Add New Team Dialog */}
      <TeamFormDialog
        isOpen={addTeamDialogOpen}
        onClose={() => setAddTeamDialogOpen(false)}
        onSubmit={(data) => handleTeamSubmit(data, "add")}
        mode="add"
      />

      {/* Add New Member Dialog */}
      <AddMemberDialog
        isOpen={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        onSubmit={handleAddMemberSubmit}
      />

      {/* Transfer Dialog */}
      <TransferDialog
        isOpen={transferDialogOpen}
        onClose={() => {
          setTransferDialogOpen(false)
          setMemberToTransfer(null)
        }}
        onSubmit={handleTransferSubmit}
        player={memberToTransfer}
        currentTeamId={selectedTeam.id}
        teams={teams}
      />
    </div>
  )
}

// Mobile View Component
function MobileTeamsView({ teams }: { readonly teams: Team[] }) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [addTeamDialogOpen, setAddTeamDialogOpen] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)

  const handleAddTeam = () => {
    setAddTeamDialogOpen(true)
  }

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
      // TODO: Implement API call to update team
      console.log("Update team:", {
        id: teamToEdit.id,
        name: data.name,
        file: data.file,
      })
      setEditDialogOpen(false)
      setTeamToEdit(null)
    } else {
      // TODO: Implement API call to create team
      console.log("Add team:", {
        name: data.name,
        file: data.file,
      })
      setAddTeamDialogOpen(false)
    }
  }

  const handleDeleteConfirm = () => {
    if (!teamToDelete) return
    
    // TODO: Implement API call to delete team
    console.log("Delete team:", teamToDelete.id)
    
    setDeleteDialogOpen(false)
    setTeamToDelete(null)
  }

  const handleTeamClick = (teamId: string) => {
    // TODO: Navigate to team detail page
    console.log("Navigate to team", teamId)
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-200 via-green-200 to-blue-200 rounded-b-3xl px-4 pt-4 pb-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚽</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Selise Super League</h1>
            <p className="text-sm text-gray-600">Season 1/2026</p>
          </div>
        </div>
      </div>

      {/* Team Management Section */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Team Management</h2>
          <Button
            size="icon"
            className="h-10 w-10 rounded-full bg-teal-500 hover:bg-teal-600"
            onClick={handleAddTeam}
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
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
                      <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shrink-0">
                        <span className="text-white text-lg">{team.icon || "⚽"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{team.name}</h3>
                        <p className="text-sm text-gray-500">
                          {team.playerCount} {team.playerCount === 1 ? "Player" : "Players"}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
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
                </CardContent>
              </Card>

              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => handleEditTeam(team.id)}>
                  <SquarePen className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteTeam(team.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
      </div>

      {/* Edit Team Dialog */}
      <TeamFormDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setTeamToEdit(null)
        }}
        onSubmit={(data) => handleTeamSubmit(data, "edit")}
        mode="edit"
        initialName={teamToEdit?.name || ""}
      />

      {/* Delete Team Dialog */}
      <DeleteTeamDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setTeamToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        teamName={teamToDelete?.name}
      />

      {/* Add New Team Dialog */}
      <TeamFormDialog
        isOpen={addTeamDialogOpen}
        onClose={() => setAddTeamDialogOpen(false)}
        onSubmit={(data) => handleTeamSubmit(data, "add")}
        mode="add"
      />
    </div>
  )
}
