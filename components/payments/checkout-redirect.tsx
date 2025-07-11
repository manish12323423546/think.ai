"use client"

// import { createCheckoutUrl } from "@/actions/stripe"
import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { createComponentLogger } from "@/lib/logger"

export function CheckoutRedirect() {
  const { isSignedIn } = useAuth()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    const handlePendingCheckout = async () => {
      // Only run once per mount and if signed in
      if (!isSignedIn || hasChecked) return

      setHasChecked(true)

      const pendingCheckout = sessionStorage.getItem("pendingCheckout")
      if (!pendingCheckout) return

      // Clear the pending checkout immediately to prevent loops
      sessionStorage.removeItem("pendingCheckout")

      // Bypass checkout functionality - Stripe disabled
      toast.info("Checkout functionality is currently disabled")
      console.log('Checkout redirect bypassed for:', pendingCheckout)
    }

    handlePendingCheckout()
  }, [isSignedIn, hasChecked])

  return null
}
