"use client"

import { ChevronsUpDown, Crown, Edit, Film, Palette, Trophy, Users } from "lucide-react"
import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { Roles } from "@/types/globals"

const roleConfig = {
  admin: {
    name: "Admin/Owner",
    icon: Crown,
    description: "Full System Access",
    color: "bg-purple-500"
  },
  writer: {
    name: "Writer",
    icon: Edit,
    description: "Script Development",
    color: "bg-blue-500"
  },
  producer: {
    name: "Producer",
    icon: Film,
    description: "Project Management",
    color: "bg-green-500"
  },
  storyboard_artist: {
    name: "Storyboard Artist",
    icon: Palette,
    description: "Visual Storytelling",
    color: "bg-orange-500"
  },
  director: {
    name: "Director",
    icon: Trophy,
    description: "Creative Leadership",
    color: "bg-indigo-500"
  },
  team_member: {
    name: "Team Member",
    icon: Users,
    description: "General Access",
    color: "bg-gray-500"
  }
}

export function TeamSwitcher({
  role
}: {
  role: Roles
}) {
  const { isMobile } = useSidebar()
  const activeRole = roleConfig[role]

  if (!activeRole) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className={`${activeRole.color} text-white flex aspect-square size-8 items-center justify-center rounded-lg`}>
                <activeRole.icon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{activeRole.name}</span>
                <span className="truncate text-xs text-muted-foreground">{activeRole.description}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Current Role
            </DropdownMenuLabel>
            <DropdownMenuItem className="gap-2 p-2 cursor-default">
              <div className={`flex size-6 items-center justify-center rounded-md ${activeRole.color}`}>
                <activeRole.icon className="size-3.5 shrink-0 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{activeRole.name}</span>
                <span className="text-xs text-muted-foreground">{activeRole.description}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-2 p-2 text-muted-foreground cursor-pointer"
              onClick={() => window.location.href = '/role-selection'}
            >
              <Crown className="size-4" />
              <div className="font-medium">Change Role</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
