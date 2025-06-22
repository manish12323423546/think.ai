import { pgEnum, pgTable, text, timestamp, uuid, json } from "drizzle-orm/pg-core"

export const membership = pgEnum("membership", ["free", "pro"])
export const userRole = pgEnum("user_role", ["admin", "writer", "producer", "storyboard_artist", "director", "team_member"])

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").unique().notNull(),
  membership: membership("membership").default("free").notNull(),
  role: userRole("role").default("team_member").notNull(),
  permissions: text("permissions").array().default([]).notNull(),
  projectAccess: text("project_access").array().default([]).notNull(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  profile: json("profile").$type<{
    specialization?: string
    department?: string
    bio?: string
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id").notNull(),
  status: text("status").default("active").notNull(),
  teamMembers: text("team_members").array().default([]).notNull(),
  settings: json("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertCustomer = typeof customers.$inferInsert
export type SelectCustomer = typeof customers.$inferSelect
export type InsertProject = typeof projects.$inferInsert
export type SelectProject = typeof projects.$inferSelect
