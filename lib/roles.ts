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
    'analytics:view',
    // Think AI permissions
    'thinkai:upload-script',
    'thinkai:script-analysis',
    'thinkai:project-overview',
    'thinkai:one-liner',
    'thinkai:character-breakdown',
    'thinkai:schedule',
    'thinkai:budget',
    'thinkai:storyboard',
    'thinkai:export'
  ],
  writer: [
    'scripts:create',
    'scripts:edit',
    'scripts:view',
    'projects:view',
    // Think AI permissions
    'thinkai:upload-script',
    'thinkai:script-analysis',
    'thinkai:one-liner',
    'thinkai:character-breakdown:read',
    'thinkai:project-overview:limited'
  ],
  producer: [
    'projects:create',
    'projects:edit',
    'projects:view',
    'scripts:view',
    'storyboards:view',
    'analytics:view',
    'users:view',
    // Think AI permissions
    'thinkai:upload-script',
    'thinkai:script-analysis',
    'thinkai:project-overview',
    'thinkai:one-liner',
    'thinkai:character-breakdown',
    'thinkai:schedule',
    'thinkai:budget',
    'thinkai:storyboard:read',
    'thinkai:export'
  ],
  storyboard_artist: [
    'storyboards:create',
    'storyboards:edit',
    'storyboards:view',
    'scripts:view',
    'projects:view',
    // Think AI permissions
    'thinkai:script-analysis:read',
    'thinkai:character-breakdown:read',
    'thinkai:storyboard',
    'thinkai:project-overview:limited'
  ],
  director: [
    'projects:edit',
    'projects:view',
    'scripts:view',
    'scripts:edit',
    'storyboards:view',
    'storyboards:edit',
    'analytics:view',
    // Think AI permissions
    'thinkai:upload-script',
    'thinkai:script-analysis',
    'thinkai:project-overview',
    'thinkai:one-liner',
    'thinkai:character-breakdown',
    'thinkai:schedule:read',
    'thinkai:budget:read',
    'thinkai:storyboard',
    'thinkai:export'
  ],
  team_member: [
    'projects:view',
    'scripts:view',
    'storyboards:view',
    // Think AI permissions
    'thinkai:script-analysis:read',
    'thinkai:project-overview:basic'
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