"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { SelectCustomer } from "@/db/schema/customers"
import { getCustomerByUserId } from "@/actions/customers"
import { Header } from "./header"
import { createComponentLogger } from "@/lib/logger"

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
          const logger = createComponentLogger('HeaderWrapper', user.id)
          logger.error('Failed to fetch customer data', error instanceof Error ? error : undefined, {
            action: 'fetchCustomerData'
          })
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
