import { getCurrentUserRole } from "@/lib/roles-server"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { RoleBasedDashboard } from "./_components/role-based-dashboard"
import { DashboardClient } from "./_components/dashboard-client"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/login")
  }

  const userRole = await getCurrentUserRole()

  const userData = {
    name: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || user.username || "User",
    email: user.emailAddresses[0]?.emailAddress || "",
    avatar: user.imageUrl,
    role: userRole,
    permissions: (user.unsafeMetadata?.permissions || user.publicMetadata?.permissions) as string[] || [],
    userId: user.id,
    unsafeMetadata: user.unsafeMetadata,
    publicMetadata: user.publicMetadata
  }

  // If no server-side role found, use client-side component to handle role checking
  if (!userRole) {
    return <DashboardClient userData={userData} />
  }

  return <RoleBasedDashboard userData={userData} />
}
