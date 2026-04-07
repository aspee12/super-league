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
import { Plus, SquarePen, Trash2, ArrowLeftRight } from "lucide-react"
import type { Team } from "./types"

interface TeamMembersPanelProps {
  team: Team
  onAddMember?: () => void
  onEditMember?: (memberId: string) => void
  onTransferMember?: (memberId: string) => void
  onDeleteMember?: (memberId: string) => void
}

export function TeamMembersPanel({
  team,
  onAddMember,
  onEditMember,
  onTransferMember,
  onDeleteMember,
}: TeamMembersPanelProps) {
  const hasActions = onEditMember || onTransferMember || onDeleteMember
  const hasGoalkeeper = team.members.some((m) => m.isGoalkeeper)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-6 mx-6 border-b border-gray-200 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
            {team.icon && (team.icon.startsWith("/") || team.icon.startsWith("http")) ? (
              <img src={team.icon} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">{team.icon || team.name.charAt(0)}</span>
            )}
          </div>
          <h2 className="text-xl font-semibold">{team.name}</h2>
        </div>
        {onAddMember && (
          <Button onClick={onAddMember} className="bg-[#267c93] hover:bg-[#1e6477] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add New Member
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden border">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#267c93] hover:bg-[#267c93]">
                <TableHead className="text-white font-semibold">Name</TableHead>
                {/* <TableHead className="text-white font-semibold">Appearances</TableHead> */}
                <TableHead className="text-white font-semibold">Goal</TableHead>
                <TableHead className="text-white font-semibold">Assist</TableHead>
                {hasGoalkeeper && (
                  <TableHead className="text-white font-semibold">CS</TableHead>
                )}
                {hasActions && (
                  <TableHead className="text-white font-semibold">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members.length > 0 ? (
                team.members.map((member) => (
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{member.name}</span>
                          {member.isGoalkeeper && (
                            <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">GK</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {/* <TableCell className="text-gray-700">{member.appearances}</TableCell> */}
                    <TableCell className="text-gray-700">{member.goals}</TableCell>
                    <TableCell className="text-gray-700">{member.assists}</TableCell>
                    {hasGoalkeeper && (
                      <TableCell className="text-gray-700">
                        {member.isGoalkeeper ? member.cleanSheets : "-"}
                      </TableCell>
                    )}
                    {hasActions && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {onEditMember && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-gray-600 hover:text-gray-900"
                              onClick={() => onEditMember(member.id)}
                            >
                              <SquarePen className="h-4 w-4" />
                            </Button>
                          )}
                          {onTransferMember && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700"
                              onClick={() => onTransferMember(member.id)}
                            >
                              <ArrowLeftRight className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteMember && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => onDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={hasActions ? (hasGoalkeeper ? 5 : 4) : (hasGoalkeeper ? 4 : 3)} className="text-center py-8 text-gray-500">
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
