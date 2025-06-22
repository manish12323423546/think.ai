import { Roles } from "@/types/globals"

// Define role permissions - safe for client components
export const ROLE_PERMISSIONS = {
  admin: [
    'projects:create',
    'projects:edit',
    'projects:delete',
    'projects:view',
    'scripts:create',
    'scripts:edit',
    'scripts:delete',
    'scripts:view',
    'storyboards:create',
    'storyboards:edit',
    'storyboards:delete',
    'storyboards:view',
    'users:manage',
    'settings:manage',
    'analytics:view'
  ],
  writer: [
    'scripts:create',
    'scripts:edit',
    'scripts:view',
    'projects:view'
  ],
  producer: [
    'projects:create',
    'projects:edit',
    'projects:view',
    'scripts:view',
    'storyboards:view',
    'analytics:view',
    'users:view'
  ],
  storyboard_artist: [
    'storyboards:create',
    'storyboards:edit',
    'storyboards:view',
    'scripts:view',
    'projects:view'
  ],
  director: [
    'projects:edit',
    'projects:view',
    'scripts:view',
    'scripts:edit',
    'storyboards:view',
    'storyboards:edit',
    'analytics:view'
  ],
  team_member: [
    'projects:view',
    'scripts:view',
    'storyboards:view'
  ]
} as const

export type Permission = (typeof ROLE_PERMISSIONS)[keyof typeof ROLE_PERMISSIONS][number]

// Role hierarchy for access control - safe for client components
export const ROLE_HIERARCHY = {
  admin: 5,
  producer: 4,
  director: 3,
  writer: 2,
  storyboard_artist: 2,
  team_member: 1
} as const

export function hasHigherRole(userRole: Roles, requiredRole: Roles): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
} 