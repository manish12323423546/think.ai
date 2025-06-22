"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { RoleBasedDashboard } from "./role-based-dashboard"
import { Roles } from "@/types/globals"

interface UserData {
  name: string
  email: string
  avatar: string
  role: Roles | null
  permissions: string[]
  userId: string
  unsafeMetadata: any
  publicMetadata: any
}

export function DashboardClient({ userData }: { userData: UserData }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [clientRole, setClientRole] = useState<Roles | null>(null)
  const [isCheckingRole, setIsCheckingRole] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      // Check for role in client-side user metadata
      const role = user.unsafeMetadata?.role || user.publicMetadata?.role
      
      if (role) {
        setClientRole(role as Roles)
        setIsCheckingRole(false)
      } else {
        // No role found, redirect to role selection
        router.push('/role-selection')
      }
    }
  }, [isLoaded, user, router])

  if (!isLoaded || isCheckingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!clientRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Setting up your role...</p>
        </div>
      </div>
    )
  }

  // Create updated user data with client-side role
  const updatedUserData = {
    ...userData,
    role: clientRole
  }

  return <RoleBasedDashboard userData={updatedUserData} />
} 