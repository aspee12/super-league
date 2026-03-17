"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Plus, SquarePen, Trash2, ArrowLeftRight, Save } from "lucide-react"
import type { Team } from "./types"

interface TeamMembersPanelProps {
  team: Team
  onAddMember: () => void
  onEditMember: (memberId: string) => void
  onSaveMember: (memberId: string, stats: { appearances: number; goals: number; assists: number }) => void
  onCancelEdit: () => void
  onTransferMember: (memberId: string) => void
  onDeleteMember: (memberId: string) => void
  editingMemberId: string | null
  playerStats: { appearances: number; goals: number; assists: number }
  onStatsChange: (stats: { appearances: number; goals: number; assists: number }) => void
}

export function TeamMembersPanel({
  team,
  onAddMember,
  onEditMember,
  onSaveMember,
  onCancelEdit,
  onTransferMember,
  onDeleteMember,
  editingMemberId,
  playerStats,
  onStatsChange,
}: TeamMembersPanelProps) {
  const handleSave = () => {
    if (editingMemberId) {
      onSaveMember(editingMemberId, playerStats)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-6 mx-6 border-b border-gray-200 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{team.icon || "⚽"}</span>
          <h2 className="text-xl font-semibold">{team.name}</h2>
        </div>
        <Button onClick={onAddMember} className="bg-[#267c93] hover:bg-[#1e6477] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Member
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#267c93] hover:bg-[#267c93]">
                <TableHead className="text-white font-semibold">Name</TableHead>
                <TableHead className="text-white font-semibold">Appearances</TableHead>
                <TableHead className="text-white font-semibold">Goal</TableHead>
                <TableHead className="text-white font-semibold">Assist</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members.length > 0 ? (
                team.members.map((member) => {
                  const isEditing = editingMemberId === member.id
                  return (
                    <TableRow key={member.id} className="bg-white">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-md">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={playerStats.appearances}
                            onChange={(e) =>
                              onStatsChange({
                                ...playerStats,
                                appearances: Number.parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20 h-8"
                          />
                        ) : (
                          member.appearances
                        )}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={playerStats.goals}
                            onChange={(e) =>
                              onStatsChange({
                                ...playerStats,
                                goals: Number.parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20 h-8"
                          />
                        ) : (
                          member.goals
                        )}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={playerStats.assists}
                            onChange={(e) =>
                              onStatsChange({
                                ...playerStats,
                                assists: Number.parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20 h-8"
                          />
                        ) : (
                          member.assists
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={onCancelEdit}
                              className="h-8"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSave}
                              className="h-8 bg-[#267c93] hover:bg-[#1e6477] text-white"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-gray-600 hover:text-gray-900"
                              onClick={() => onEditMember(member.id)}
                            >
                              <SquarePen className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700"
                              onClick={() => onTransferMember(member.id)}
                            >
                              <ArrowLeftRight className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => onDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No members found. Add a new member to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
