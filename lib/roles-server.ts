import { auth } from "@clerk/nextjs/server"
import { clerkClient } from "@clerk/nextjs/server"
import { currentUser } from "@clerk/nextjs/server"
import { Roles } from "@/types/globals"
import { ROLE_PERMISSIONS } from "./roles"

// Server-side role checking
export async function checkRole(role: Roles) {
  const { sessionClaims } = await auth()
  const userRole = sessionClaims?.unsafeMetadata?.role || sessionClaims?.metadata?.role
  return userRole === role
}

export async function checkPermission(permission: string) {
  const { sessionClaims } = await auth()
  const userRole = (sessionClaims?.unsafeMetadata?.role || sessionClaims?.metadata?.role) as Roles
  if (!userRole) return false
  
  return ROLE_PERMISSIONS[userRole]?.includes(permission as any) || false
}

export async function getCurrentUserRole(): Promise<Roles | null> {
  try {
    // Get current user data directly instead of relying on session claims
    const user = await currentUser()
    if (!user) return null
    
    // Check user metadata directly
    const role = user.unsafeMetadata?.role || user.publicMetadata?.role || user.privateMetadata?.role
    
    return role as Roles || null
  } catch (error) {
    console.error('Error getting current user role:', error)
    return null
  }
}

export async function getCurrentUserPermissions(): Promise<string[]> {
  const { sessionClaims } = await auth()
  const userRole = (sessionClaims?.unsafeMetadata?.role || sessionClaims?.metadata?.role) as Roles
  if (!userRole) return []
  
  return [...ROLE_PERMISSIONS[userRole]]
}

// Set user role (for admin use)
export async function setUserRole(userId: string, role: Roles) {
  try {
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
        permissions: [...ROLE_PERMISSIONS[role]]
      }
    })
    return { success: true }
  } catch (error) {
    console.error('Error setting user role:', error)
    return { success: false, error: 'Failed to set user role' }
  }
}

// Check if user has access to specific project
export async function hasProjectAccess(projectId: string): Promise<boolean> {
  const { sessionClaims } = await auth()
  const userRole = (sessionClaims?.unsafeMetadata?.role || sessionClaims?.metadata?.role) as Roles
  const projectAccess = sessionClaims?.unsafeMetadata?.projects || sessionClaims?.metadata?.projects || []
  
  // Admins and producers have access to all projects
  if (userRole === 'admin' || userRole === 'producer') {
    return true
  }
  
  // Check if user has specific project access
  return projectAccess.includes(projectId)
} 