// import { getBillingDataByUserId } from "@/actions/customers"
import { auth } from "@clerk/nextjs/server"
import { AlertCircle, CreditCard, Film, Zap, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { logger } from "@/lib/logger"

export default async function BillingPage() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div>
        <div className="bg-destructive/10 flex items-center gap-3 rounded-lg p-4">
          <AlertCircle className="text-destructive h-5 w-5" />
          <p className="text-foreground text-sm">
            Unable to load billing information. Please try again.
          </p>
        </div>
      </div>
    )
  }

  // Bypass customer billing data - use default values
  const customerResponse = {
    customer: null,
    clerkEmail: null,
    stripeEmail: null,
    subscription: null
  }
  logger.debug('Retrieved billing data for user', {
    userId,
    component: 'BillingPage',
    metadata: {
      hasCustomer: !!customerResponse.customer,
      hasSubscription: !!customerResponse.subscription
    }
  })

  const customerData = customerResponse.customer

  if (!customerData) {
    return (
      <div>
        <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please complete your profile setup to access billing information.
          </p>
        </div>
      </div>
    )
  }

  const planDetails = {
    free: {
      name: "Starter Plan",
      icon: Film,
      features: ["Up to 2 projects", "Basic script analysis", "Community support"],
      color: "text-gray-600"
    },
    indie: {
      name: "Indie Filmmaker",
      icon: Zap,
      features: ["Up to 5 projects", "AI script breakdown", "Email support", "50 storyboards/month"],
      color: "text-blue-600"
    },
    pro: {
      name: "Studio Pro",
      icon: Crown,
      features: ["Unlimited projects", "Advanced AI features", "Priority support", "Unlimited storyboards"],
      color: "text-purple-600"
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentPlan = planDetails[((customerData as any)?.membership as keyof typeof planDetails) || "free"] || planDetails.free

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <CreditCard className="text-muted-foreground h-8 w-8" />
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground">
          Manage your Think AI subscription and billing information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Current Plan */}
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <currentPlan.icon className={`h-6 w-6 ${currentPlan.color}`} />
              <div>
                <h2 className="text-xl font-semibold">{currentPlan.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Your current subscription plan
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">Plan Features:</h3>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-brand-primary rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(customerData as any)?.membership === "free" && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-medium mb-2">Ready to upgrade?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Unlock advanced AI features and unlimited projects with our paid plans.
                </p>
                <Button asChild>
                  <Link href="/pricing">
                    Upgrade Now
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Usage Stats (placeholder) */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Current Usage</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Projects This Month</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(customerData as any)?.membership === "free" ? "of 2 allowed" : "Unlimited"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scripts Processed</p>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Storyboards Generated</p>
                <p className="text-2xl font-bold">23</p>
                                 <p className="text-xs text-muted-foreground">
                   {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                 {(customerData as any)?.membership === "free" ? "Limited" : "Unlimited"}
                 </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Analysis Hours</p>
                <p className="text-2xl font-bold">12.5</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Billing Actions</h2>
          
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                View All Plans
              </Link>
            </Button>
            
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(customerData as any)?.membership !== "free" && (
              <>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Payment Method
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Film className="mr-2 h-4 w-4" />
                  Download Invoices
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  Cancel Subscription
                </Button>
              </>
            )}
          </div>

          {/* Billing Support */}
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="font-medium mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Contact our billing support team for assistance with your subscription.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/support">
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
