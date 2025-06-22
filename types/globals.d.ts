export {}

export type Roles = 'admin' | 'writer' | 'producer' | 'storyboard_artist' | 'director' | 'team_member'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
      permissions?: string[]
      projects?: string[]
    }
    unsafeMetadata: {
      role?: Roles
      permissions?: string[]
      projects?: string[]
    }
  }
} 