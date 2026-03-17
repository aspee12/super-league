"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Check, SquarePen, Trash2 } from "lucide-react"
import type { Team } from "./types"

interface TeamsSidebarProps {
  teams: Team[]
  selectedTeamId: string
  onSelectTeam: (teamId: string) => void
  onAddTeam?: () => void
  onEditTeam?: (teamId: string) => void
  onDeleteTeam?: (teamId: string) => void
}

export function TeamsSidebar({
  teams,
  selectedTeamId,
  onSelectTeam,
  onAddTeam,
  onEditTeam,
  onDeleteTeam,
}: TeamsSidebarProps) {
  return (
    <Card className="h-fit">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <h2 className="text-xl font-semibold">Teams</h2>
        {onAddTeam && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onAddTeam}
            className="h-8 w-8 bg-gray-100 rounded"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-2">
            {teams.map((team) => {
              const isSelected = team.id === selectedTeamId
              return (
                <div
                  key={team.id}
                  role="button"
                  tabIndex={0}
                  className={`
                    relative w-full flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors text-left
                    ${
                      isSelected
                        ? "bg-[#267c93] text-gray-900"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }
                  `}
                  onClick={() => onSelectTeam(team.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectTeam(team.id) }}
                >
                  {isSelected && <Check className="h-5 w-5 shrink-0" />}
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {team.icon && (team.icon.startsWith("/") || team.icon.startsWith("http")) ? (
                      <img src={team.icon} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{team.icon || team.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="flex-1 font-medium">{team.name}</span>
                  {(onEditTeam || onDeleteTeam) && (
                    <div className="flex items-center gap-1">
                      {onEditTeam && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 bg-gray-100 rounded ${
                            isSelected
                              ? "text-gray-900 hover:bg-[#1e6477]"
                              : "text-gray-500 hover:bg-gray-200"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditTeam(team.id)
                          }}
                        >
                          <SquarePen className="h-4 w-4" />
                        </Button>
                      )}
                      {onDeleteTeam && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 bg-gray-100 rounded ${
                            isSelected
                              ? "text-red-500 hover:bg-[#1e6477]"
                              : "text-red-500 hover:bg-red-50"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteTeam(team.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
