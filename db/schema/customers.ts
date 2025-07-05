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

// Script-related tables
export const scripts = pgTable("scripts", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  userId: text("user_id").notNull(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  parsedData: json("parsed_data"),
  validation: json("validation"),
  status: text("status").default("uploaded").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const scriptAnalysis = pgTable("script_analysis", {
  id: uuid("id").defaultRandom().primaryKey(),
  scriptId: uuid("script_id").references(() => scripts.id).notNull(),
  analysisType: text("analysis_type").notNull(),
  results: json("results").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

export const oneLiners = pgTable("one_liners", {
  id: uuid("id").defaultRandom().primaryKey(),
  scriptId: uuid("script_id").references(() => scripts.id).notNull(),
  scenes: json("scenes").notNull(),
  overallSummary: text("overall_summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

export const characterBreakdowns = pgTable("character_breakdowns", {
  id: uuid("id").defaultRandom().primaryKey(),
  scriptId: uuid("script_id").references(() => scripts.id).notNull(),
  characters: json("characters").notNull(),
  relationships: json("relationships").notNull(),
  sceneMatrix: json("scene_matrix").notNull(),
  statistics: json("statistics").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
})

export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  schedule: json("schedule").notNull(),
  locationPlan: json("location_plan").notNull(),
  crewAllocation: json("crew_allocation").notNull(),
  ganttData: json("gantt_data"),
  summary: json("summary").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  scheduleId: uuid("schedule_id").references(() => schedules.id),
  totalBudget: text("total_budget").notNull(),
  categories: json("categories").notNull(),
  locationCosts: json("location_costs").notNull(),
  equipmentCosts: json("equipment_costs").notNull(),
  personnelCosts: json("personnel_costs").notNull(),
  logisticsCosts: json("logistics_costs").notNull(),
  summary: json("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export const storyboards = pgTable("storyboards", {
  id: uuid("id").defaultRandom().primaryKey(),
  scriptId: uuid("script_id").references(() => scripts.id).notNull(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  scenes: json("scenes").notNull(),
  settings: json("settings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
})

export type InsertCustomer = typeof customers.$inferInsert
export type SelectCustomer = typeof customers.$inferSelect
export type InsertProject = typeof projects.$inferInsert
export type SelectProject = typeof projects.$inferSelect
export type InsertScript = typeof scripts.$inferInsert
export type SelectScript = typeof scripts.$inferSelect
export type InsertScriptAnalysis = typeof scriptAnalysis.$inferInsert
export type SelectScriptAnalysis = typeof scriptAnalysis.$inferSelect
export type InsertOneLiner = typeof oneLiners.$inferInsert
export type SelectOneLiner = typeof oneLiners.$inferSelect
export type InsertCharacterBreakdown = typeof characterBreakdowns.$inferInsert
export type SelectCharacterBreakdown = typeof characterBreakdowns.$inferSelect
export type InsertSchedule = typeof schedules.$inferInsert
export type SelectSchedule = typeof schedules.$inferSelect
export type InsertBudget = typeof budgets.$inferInsert
export type SelectBudget = typeof budgets.$inferSelect
export type InsertStoryboard = typeof storyboards.$inferInsert
export type SelectStoryboard = typeof storyboards.$inferSelect
