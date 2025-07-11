// import {
//   manageSubscriptionStatusChange,
//   updateStripeCustomer
// } from "@/actions/stripe"
import { stripe } from "@/lib/stripe"
import { createRequestLogger } from "@/lib/logger"
import { headers } from "next/headers"
import { NextRequest } from "next/server"
import Stripe from "stripe"

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated",
  "customer.subscription.deleted"
])

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID()
  const logger = createRequestLogger(req, requestId)
  
  logger.info('Processing Stripe webhook')
  
  const body = await req.text()
  const sig = (await headers()).get("Stripe-Signature") as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) {
      throw new Error("Webhook secret or signature missing")
    }

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    logger.error('Webhook signature verification failed', err as Error)
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error"
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    )
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await handleSubscriptionChange(event)
          break

        case "checkout.session.completed":
          await handleCheckoutSession(event)
          break

        default:
          throw new Error("Unhandled relevant event!")
      }
    } catch (error) {
      logger.error('Webhook handler failed', error as Error, { 
        component: 'StripeWebhook',
        metadata: { eventType: event.type }
      })
      return new Response(
        JSON.stringify({
          error: "Webhook handler failed. View your function logs."
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      )
    }
  }

  return new Response(JSON.stringify({ received: true }))
}

async function handleSubscriptionChange(event: Stripe.Event) {
  // Bypass subscription change handling - Stripe functionality disabled
  console.log('Stripe subscription change bypassed:', event.type)
}

async function handleCheckoutSession(event: Stripe.Event) {
  // Bypass checkout session handling - Stripe functionality disabled
  console.log('Stripe checkout session bypassed:', event.type)
}
