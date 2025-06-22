"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { SelectCustomer } from "@/db/schema/customers"
import { getCustomerByUserId } from "@/actions/customers"
import { Header } from "./header"

export function HeaderWrapper() {
  const { user, isLoaded } = useUser()
  const [membership, setMembership] = useState<SelectCustomer["membership"] | null>(null)

  useEffect(() => {
    async function fetchMembership() {
      if (isLoaded && user) {
        try {
          const customer = await getCustomerByUserId(user.id)
          setMembership(customer?.membership ?? "free")
        } catch (error) {
          console.error("Error fetching customer data:", error)
          setMembership("free")
        }
      } else if (isLoaded && !user) {
        setMembership(null)
      }
    }

    fetchMembership()
  }, [user, isLoaded])

  return <Header userMembership={membership} />
}
