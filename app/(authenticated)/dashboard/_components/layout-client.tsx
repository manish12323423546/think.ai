"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { AppSidebar } from "./app-sidebar"
import { Roles } from "@/types/globals"

export default function DashboardClientLayout({
  children,
  userData
}: {
  children: React.ReactNode
  userData: {
    name: string
    email: string
    avatar: string
    membership: string
    role: Roles
    permissions: string[]
    userId: string
  }
}) {
  const pathname = usePathname()

  // Read the sidebar state from cookie on initial load
  const getCookieValue = (name: string) => {
    if (typeof document === "undefined") return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(";").shift()
    return null
  }

  const savedState = getCookieValue("sidebar_state")
  const defaultOpen = savedState === null ? true : savedState === "true"

  const getBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean)
    const breadcrumbs: Array<{
      name: string
      href: string
      current: boolean
    }> = []

    // Add Dashboard as root
    breadcrumbs.push({
      name: "Dashboard",
      href: "/dashboard",
      current: pathname === "/dashboard"
    })

    // Build breadcrumbs from path segments
    if (pathSegments.length > 1) {
      let currentPath = ""
      
      for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i]
        currentPath += `/${segment}`
        const fullPath = `/dashboard${currentPath}`
        
        // Format segment name
        let segmentName = segment
          .split("-")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

        // Handle special cases
        if (segment === "account") {
          segmentName = "Account Settings"
        } else if (segment === "billing") {
          segmentName = "Billing & Subscription"
        } else if (segment === "support") {
          segmentName = "Support & Help"
        } else if (segment === "scripts") {
          segmentName = "Script Editor"
        } else if (segment === "storyboards") {
          segmentName = "Storyboards"
        } else if (segment === "projects") {
          segmentName = "Projects"
        } else if (segment === "analytics") {
          segmentName = "Analytics"
        } else if (segment === "admin") {
          segmentName = "Admin Panel"
        }

        const isLast = i === pathSegments.length - 1
        
        breadcrumbs.push({
          name: segmentName,
          href: fullPath,
          current: isLast
        })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar userData={userData} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <div
                      key={`${crumb.href}-${index}`}
                      className="flex items-center"
                    >
                      {index > 0 && <BreadcrumbSeparator className="mx-2" />}
                      <BreadcrumbItem>
                        {crumb.current ? (
                          <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href}>
                            {crumb.name}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
