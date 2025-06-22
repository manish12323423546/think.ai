"use client"

import { useAuth, useUser } from "@clerk/nextjs"
import { Roles } from "@/types/globals"
import { ROLE_PERMISSIONS, ROLE_HIERARCHY } from "@/lib/roles"

export function useRole() {
  const { user } = useUser()
  const { isLoaded } = useAuth()

  const role = user?.unsafeMetadata?.role as Roles | undefined
  const permissions = user?.unsafeMetadata?.permissions as string[] | undefined

  return {
    role,
    permissions: permissions || [],
    isLoaded,
    hasRole: (requiredRole: Roles) => role === requiredRole,
    hasPermission: (permission: string) => 
      permissions?.includes(permission) || false,
    hasAnyPermission: (permissionList: string[]) =>
      permissionList.some(p => permissions?.includes(p)) || false,
    hasHigherRole: (requiredRole: Roles) => {
      if (!role) return false
      return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole]
    },
    isAdmin: () => role === 'admin',
    isWriter: () => role === 'writer',
    isProducer: () => role === 'producer',
    isDirector: () => role === 'director',
    isStoryboardArtist: () => role === 'storyboard_artist',
    isTeamMember: () => role === 'team_member'
  }
}

export function useProjectAccess() {
  const { user } = useUser()
  const role = user?.unsafeMetadata?.role as Roles | undefined
  const projectAccess = user?.unsafeMetadata?.projects as string[] | undefined

  return {
    hasProjectAccess: (projectId: string) => {
      // Admins and producers have access to all projects
      if (role === 'admin' || role === 'producer') {
        return true
      }
      
      // Check if user has specific project access
      return projectAccess?.includes(projectId) || false
    },
    projectAccess: projectAccess || [],
    canAccessAllProjects: role === 'admin' || role === 'producer'
  }
}

// Helper hook for conditional rendering based on roles
export function useRoleAccess() {
  const roleInfo = useRole()
  
  return {
    ...roleInfo,
    canManageUsers: roleInfo.hasPermission('users:manage'),
    canCreateProjects: roleInfo.hasPermission('projects:create'),
    canEditProjects: roleInfo.hasPermission('projects:edit'),
    canDeleteProjects: roleInfo.hasPermission('projects:delete'),
    canViewProjects: roleInfo.hasPermission('projects:view'),
    canCreateScripts: roleInfo.hasPermission('scripts:create'),
    canEditScripts: roleInfo.hasPermission('scripts:edit'),
    canViewScripts: roleInfo.hasPermission('scripts:view'),
    canCreateStoryboards: roleInfo.hasPermission('storyboards:create'),
    canEditStoryboards: roleInfo.hasPermission('storyboards:edit'),
    canViewStoryboards: roleInfo.hasPermission('storyboards:view'),
    canViewAnalytics: roleInfo.hasPermission('analytics:view'),
    canManageSettings: roleInfo.hasPermission('settings:manage')
  }
} 