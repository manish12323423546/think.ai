"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { SelectCustomer } from "@/db/schema/customers"
// import { getCustomerByUserId } from "@/actions/customers"
import { Header } from "./header"
import { createComponentLogger } from "@/lib/logger"

export function HeaderWrapper() {
  const { user, isLoaded } = useUser()
  const [membership, setMembership] = useState<SelectCustomer["membership"] | null>(null)

  useEffect(() => {
    // Bypass customer data fetching - use default values
    if (isLoaded && user) {
      setMembership("free") // Default to free membership
    } else if (isLoaded && !user) {
      setMembership(null)
    }
  }, [user, isLoaded])

  return <Header userMembership={membership} />
}
