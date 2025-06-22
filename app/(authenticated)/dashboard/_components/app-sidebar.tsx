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
  Layers
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

  // Projects - available to most roles
  if (permissions.includes('projects:view')) {
    items.push({
      title: "Projects",
      url: "/dashboard/projects",
      icon: FolderOpen,
      items: [
        ...(permissions.includes('projects:create') ? [{
          title: "Create Project",
          url: "/dashboard/projects/create",
          icon: PlusCircle
        }] : []),
        {
          title: "My Projects",
          url: "/dashboard/projects",
          icon: FileText
        }
      ]
    })
  }

  // Scripts - for writers, directors, admins
  if (permissions.includes('scripts:view')) {
    items.push({
      title: "Scripts",
      url: "/dashboard/scripts",
      icon: Edit3,
      items: [
        ...(permissions.includes('scripts:create') ? [{
          title: "New Script",
          url: "/dashboard/scripts/create",
          icon: PlusCircle
        }] : []),
        {
          title: "My Scripts",
          url: "/dashboard/scripts",
          icon: FileText
        }
      ]
    })
  }

  // Storyboards - for storyboard artists, directors, producers, admins
  if (permissions.includes('storyboards:view')) {
    items.push({
      title: "Storyboards",
      url: "/dashboard/storyboards",
      icon: Palette,
      items: [
        ...(permissions.includes('storyboards:create') ? [{
          title: "New Storyboard",
          url: "/dashboard/storyboards/create",
          icon: PlusCircle
        }] : []),
        {
          title: "My Storyboards",
          url: "/dashboard/storyboards",
          icon: Layers
        }
      ]
    })
  }

  // Analytics - for producers, directors, admins
  if (permissions.includes('analytics:view')) {
    items.push({
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3
    })
  }

  // User Management - admin only
  if (permissions.includes('users:manage')) {
    items.push({
      title: "User Management",
      url: "/dashboard/admin/users",
      icon: Users,
      items: [
        {
          title: "All Users",
          url: "/dashboard/admin/users",
          icon: Users
        },
        {
          title: "Roles & Permissions",
          url: "/dashboard/admin/roles",
          icon: Crown
        }
      ]
    })
  }

  // Settings - available to admins and some other roles
  if (permissions.includes('settings:manage') || role === 'admin') {
    items.push({
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings
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
