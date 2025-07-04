import { getCustomerByUserId } from "@/actions/customers"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import DashboardClientLayout from "./_components/layout-client"
import { getCurrentUserRole } from "@/lib/roles-server"
import { Roles } from "@/types/globals"
import { logger } from "@/lib/logger"

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

  // Try to get customer data, but don't block access if database is unavailable
  let customer = null
  try {
    customer = await getCustomerByUserId(user.id)
  } catch (error) {
    logger.warn('Customer data unavailable, continuing with default access', error instanceof Error ? error : undefined, {
      userId: user.id,
      component: 'DashboardLayout'
    })
  }

  // Allow access based on role - this is a creative studio where roles determine access
  // Pro membership check can be added later for specific premium features if needed
  const hasAccess = !!userRole // Anyone with a role can access the dashboard

  if (!hasAccess) {
    redirect("/role-selection")
  }

  const userData = {
    name: user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.firstName || user.username || "User",
    email: user.emailAddresses[0]?.emailAddress || "",
    avatar: user.imageUrl,
    membership: customer?.membership || "free",
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
