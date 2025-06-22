"use client"

import { useRole } from "@/hooks/use-roles"
import { Roles } from "@/types/globals"
import { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface RoleGateProps {
  children: ReactNode
  allowedRoles?: Roles[]
  requiredPermissions?: string[]
  requiredPermissionsMode?: 'any' | 'all'
  fallback?: ReactNode
  loading?: ReactNode
}

export function RoleGate({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  requiredPermissionsMode = 'any',
  fallback = null,
  loading = <Skeleton className="h-4 w-32" />
}: RoleGateProps) {
  const { role, hasPermission, hasAnyPermission, isLoaded } = useRole()

  // Show loading state while auth is loading
  if (!isLoaded) {
    return <>{loading}</>
  }

  // Check role-based access
  const hasRoleAccess = allowedRoles.length === 0 || (role && allowedRoles.includes(role))

  // Check permission-based access
  let hasPermissionAccess = true
  if (requiredPermissions.length > 0) {
    if (requiredPermissionsMode === 'all') {
      hasPermissionAccess = requiredPermissions.every(permission => hasPermission(permission))
    } else {
      hasPermissionAccess = hasAnyPermission(requiredPermissions)
    }
  }

  // Grant access if both role and permission checks pass
  if (hasRoleAccess && hasPermissionAccess) {
    return <>{children}</>
  }

  // Show fallback if access is denied
  return <>{fallback}</>
}

// Convenience components for specific roles
export function AdminOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <RoleGate allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGate>
  )
}

export function WriterOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <RoleGate allowedRoles={['writer']} fallback={fallback}>
      {children}
    </RoleGate>
  )
}

export function ProducerOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <RoleGate allowedRoles={['producer']} fallback={fallback}>
      {children}
    </RoleGate>
  )
}

export function StoryboardArtistOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <RoleGate allowedRoles={['storyboard_artist']} fallback={fallback}>
      {children}
    </RoleGate>
  )
}

export function DirectorOnly({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <RoleGate allowedRoles={['director']} fallback={fallback}>
      {children}
    </RoleGate>
  )
}

// Permission-based components
export function CanManageProjects({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <RoleGate 
      requiredPermissions={['projects:create', 'projects:edit']} 
      requiredPermissionsMode="any"
      fallback={fallback}
    >
      {children}
    </RoleGate>
  )
}

export function CanEditScripts({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <RoleGate 
      requiredPermissions={['scripts:edit']} 
      fallback={fallback}
    >
      {children}
    </RoleGate>
  )
}

export function CanCreateStoryboards({ 
  children, 
  fallback = null 
}: { 
  children: ReactNode
  fallback?: ReactNode 
}) {
  return (
    <RoleGate 
      requiredPermissions={['storyboards:create']} 
      fallback={fallback}
    >
      {children}
    </RoleGate>
  )
} 