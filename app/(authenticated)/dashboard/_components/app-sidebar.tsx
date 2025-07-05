"use client"

import { NavMain } from "@/app/(authenticated)/dashboard/_components/nav-main"
import { NavUser } from "@/app/(authenticated)/dashboard/_components/nav-user"
import { TeamSwitcher } from "@/app/(authenticated)/dashboard/_components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from "@/components/ui/sidebar"
import { Roles } from "@/types/globals"
import { 
  Film, 
  Edit3, 
  Palette, 
  BarChart3, 
  Settings, 
  Users, 
  FolderOpen,
  Crown,
  PlusCircle,
  FileText,
  Layers,
  Upload,
  Calendar,
  DollarSign,
  Layout
} from "lucide-react"

// Define navigation items based on roles
const getNavigationItems = (role: Roles, permissions: string[]) => {
  const items = []

  // Dashboard - available to all
  items.push({
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    isActive: false
  })


  // Think AI Features - admin only
  if (role === 'admin') {
    items.push({
      title: "Think AI",
      url: "/dashboard/admin/upload-script",
      icon: Film,
      items: [
        {
          title: "Upload Script",
          url: "/dashboard/admin/upload-script",
          icon: Upload
        },
        {
          title: "Script Analysis",
          url: "/dashboard/admin/script-analysis",
          icon: FileText
        },
        {
          title: "One-Liner",
          url: "/dashboard/admin/one-liner",
          icon: Edit3
        },
        {
          title: "Character Breakdown",
          url: "/dashboard/admin/character-breakdown",
          icon: Users
        },
        {
          title: "Schedule",
          url: "/dashboard/admin/schedule",
          icon: Calendar
        },
        {
          title: "Budget",
          url: "/dashboard/admin/budget",
          icon: DollarSign
        },
        {
          title: "Storyboard",
          url: "/dashboard/admin/storyboard",
          icon: Layers
        },
        {
          title: "Project Overview",
          url: "/dashboard/admin/project-overview",
          icon: Layout
        }
      ]
    })
  }


  return items
}

export function AppSidebar({ 
  userData,
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  userData: {
    name: string
    email: string
    avatar: string
    membership: string
    role: Roles
    permissions: string[]
    userId: string
  }
}) {
  const navigationItems = getNavigationItems(userData.role, userData.permissions)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher role={userData.role} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
