"use client"

// import { createCheckoutUrl } from "@/actions/stripe"
import { Button } from "@/components/ui/button"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createComponentLogger } from "@/lib/logger"

interface PricingButtonProps {
  paymentLink: string
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "secondary"
}

export function PricingButton({
  paymentLink,
  children,
  className,
  variant = "default"
}: PricingButtonProps) {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    // Bypass payment functionality - Stripe disabled
    toast.info("Payment functionality is currently disabled")
    console.log('Payment bypassed for:', paymentLink)
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
      variant={variant}
    >
      {isLoading ? "Loading..." : children}
    </Button>
  )
}
