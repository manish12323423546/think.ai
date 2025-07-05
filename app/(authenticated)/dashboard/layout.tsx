import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DashboardClientLayout from "./_components/layout-client"
import { getCurrentUserRole } from "@/lib/roles-server"
import { Roles } from "@/types/globals"

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect("/login")
  }

  // Get user role from Clerk metadata
  const userRole = await getCurrentUserRole()
  
  // If user doesn't have a role, redirect to role selection
  if (!userRole) {
    redirect("/role-selection")
  }

  // Allow access based on role - this is a creative studio where roles determine access
  const hasAccess = !!userRole // Anyone with a role can access the dashboard

  if (!hasAccess) {
    redirect("/role-selection")
  }

  // Use localStorage-based defaults instead of database to avoid connection issues
  const userData = {
    name: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || user.username || "User",
    email: user.emailAddresses[0]?.emailAddress || "",
    avatar: user.imageUrl,
    membership: "free", // Default to free membership
    role: userRole,
    permissions: user.unsafeMetadata?.permissions as string[] || [],
    userId: user.id
  }

  return (
    <DashboardClientLayout userData={userData}>
      {children}
    </DashboardClientLayout>
  )
}
