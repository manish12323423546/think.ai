"use server"

import { clerkClient } from "@clerk/nextjs/server"
import { currentUser } from "@clerk/nextjs/server"
import { Roles } from "@/types/globals"
import { ROLE_PERMISSIONS } from "@/lib/roles"

export async function updateCurrentUserRole(role: Roles) {
  const user = await currentUser()
  if (!user) {
    throw new Error("Unauthenticated")
  }
  const client = await clerkClient()
  await client.users.updateUserMetadata(user.id, {
    unsafeMetadata: {
      role,
      permissions: ROLE_PERMISSIONS[role]
    }
  })
  return { success: true }
}
