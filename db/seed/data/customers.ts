import { type InsertCustomer } from "../../schema/customers"

// Clerk user ID for seeding, configure via env to avoid committing real IDs
export const userId = process.env.SEED_USER_ID || "replace-with-user-id"

export const customersData: InsertCustomer[] = [
  {
    userId,
    membership: "pro", // default to pro for testing,
    stripeCustomerId: "cus_Q324234234234234234234234", // random test value
    stripeSubscriptionId: "sub_Q324234234234234234234234", // random test value
    createdAt: new Date(),
    updatedAt: new Date()
  }
]
