"use client"

import { Roles } from "@/types/globals"
import { AdminDashboard } from "./dashboards/admin-dashboard"
import { WriterDashboard } from "./dashboards/writer-dashboard"
import { ProducerDashboard } from "./dashboards/producer-dashboard"
import { StoryboardArtistDashboard } from "./dashboards/storyboard-artist-dashboard"
import { DirectorDashboard } from "./dashboards/director-dashboard"
import { TeamMemberDashboard } from "./dashboards/team-member-dashboard"

interface UserData {
  name: string
  email: string
  avatar: string
  role: Roles
  permissions: string[]
  userId: string
  unsafeMetadata?: any
  publicMetadata?: any
}

export function RoleBasedDashboard({ userData }: { userData: UserData }) {
  // Route to the appropriate dashboard based on user role
  switch (userData.role) {
    case 'admin':
      return <AdminDashboard userData={userData} />
    case 'writer':
      return <WriterDashboard userData={userData} />
    case 'producer':
      return <ProducerDashboard userData={userData} />
    case 'storyboard_artist':
      return <StoryboardArtistDashboard userData={userData} />
    case 'director':
      return <DirectorDashboard userData={userData} />
    case 'team_member':
      return <TeamMemberDashboard userData={userData} />
    default:
      // Default fallback - show a basic dashboard
  return (
    <div className="space-y-8">
      <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome to Your Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {userData.name}! Please select a role to continue.
            </p>
      </div>
    </div>
  )
  }
} 