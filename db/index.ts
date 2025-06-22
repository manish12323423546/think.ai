import { config } from "dotenv"
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { customers } from "./schema/customers"

config({ path: ".env" })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set")
}

const dbSchema = {
  // tables
  customers
  // relations
}

function initializeDb(url: string) {
  try {
    const client = postgres(url, { 
      prepare: false,
      connection: {
        application_name: 'think-ai-platform'
      }
    })
    return drizzlePostgres(client, { schema: dbSchema })
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

export const db = initializeDb(databaseUrl)
