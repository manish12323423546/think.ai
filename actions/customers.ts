"use server"

import { db } from "@/db"
import { customers, type SelectCustomer } from "@/db/schema/customers"
import { currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"

export async function getCustomerByUserId(
  userId: string
): Promise<SelectCustomer | null> {
  try {
    const user = await currentUser().catch(() => null)
    if (user && user.id !== userId) {
      throw new Error('Unauthorized access to customer data')
    }
    // Add timeout protection
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000)
    })
    
    const queryPromise = db.query.customers.findFirst({
      where: eq(customers.userId, userId)
    })
    
    const customer = await Promise.race([queryPromise, timeoutPromise])
    return customer || null
  } catch (error) {
    console.error('Database connection error in getCustomerByUserId:', error)
    // Return a default customer object to prevent app crashes
    return {
      id: userId,
      userId,
      membership: "free",
      role: "team_member",
      permissions: [],
      projectAccess: [],
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      profile: null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as SelectCustomer
  }
}

export async function getBillingDataByUserId(userId: string): Promise<{
  customer: SelectCustomer | null
  clerkEmail: string | null
  stripeEmail: string | null
}> {
  try {
    // Get Clerk user data
    const user = await currentUser()
    if (user && user.id !== userId) {
      throw new Error('Unauthorized access to billing data')
    }

    // Get profile to fetch Stripe customer ID with timeout protection
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Database query timeout')), 5000)
    })
    
    const queryPromise = db.query.customers.findFirst({
      where: eq(customers.userId, userId)
    })
    
    const customer = await Promise.race([queryPromise, timeoutPromise])

    // Get Stripe email if it exists
    const stripeEmail = customer?.stripeCustomerId
      ? user?.emailAddresses[0]?.emailAddress || null
      : null

    return {
      customer: customer || null,
      clerkEmail: user?.emailAddresses[0]?.emailAddress || null,
      stripeEmail
    }
  } catch (error) {
    console.error('Database connection error in getBillingDataByUserId:', error)
    const user = await currentUser()
    return {
      customer: null,
      clerkEmail: user?.emailAddresses[0]?.emailAddress || null,
      stripeEmail: null
    }
  }
}

export async function createCustomer(
  userId: string
): Promise<{ isSuccess: boolean; data?: SelectCustomer }> {
  try {
    const user = await currentUser().catch(() => null)
    if (user && user.id !== userId) {
      throw new Error('Unauthorized create customer request')
    }
    const [newCustomer] = await db
      .insert(customers)
      .values({
        userId,
        membership: "free"
      })
      .returning()

    if (!newCustomer) {
      return { isSuccess: false }
    }

    return { isSuccess: true, data: newCustomer }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { isSuccess: false }
  }
}

export async function updateCustomerByUserId(
  userId: string,
  updates: Partial<SelectCustomer>
): Promise<{ isSuccess: boolean; data?: SelectCustomer }> {
  try {
    const user = await currentUser().catch(() => null)
    if (user && user.id !== userId) {
      throw new Error('Unauthorized update attempt')
    }
    const [updatedCustomer] = await db
      .update(customers)
      .set(updates)
      .where(eq(customers.userId, userId))
      .returning()

    if (!updatedCustomer) {
      return { isSuccess: false }
    }

    return { isSuccess: true, data: updatedCustomer }
  } catch (error) {
    console.error("Error updating customer by userId:", error)
    return { isSuccess: false }
  }
}

export async function updateCustomerByStripeCustomerId(
  stripeCustomerId: string,
  updates: Partial<SelectCustomer>
): Promise<{ isSuccess: boolean; data?: SelectCustomer }> {
  try {
    const [updatedCustomer] = await db
      .update(customers)
      .set(updates)
      .where(eq(customers.stripeCustomerId, stripeCustomerId))
      .returning()

    if (!updatedCustomer) {
      return { isSuccess: false }
    }

    return { isSuccess: true, data: updatedCustomer }
  } catch (error) {
    console.error("Error updating customer by stripeCustomerId:", error)
    return { isSuccess: false }
  }
}
