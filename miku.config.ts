import { defineMiku } from "@wpcodingpress/miku/config"
import { Pool } from "pg"

// Lazy pool — created on first server-side use, never at build time.
let pool: Pool | null = null
function getPool(): Pool {
  if (pool) return pool
  const connectionString = process.env.MIKU_DB_URL
  if (!connectionString) throw new Error("MIKU: MIKU_DB_URL is not set")
  pool = new Pool({
    connectionString,
    max: 4,
    ssl: process.env.MIKU_DB_SSL === "0" ? undefined : { rejectUnauthorized: false },
  })
  return pool
}

export default defineMiku({
  brand: {
    name: "AiYaan's Footwear",
    assistantName: "MIKU for Aiyaan",
    tagline: "Ask us anything!",
    accent: "#ad0538",
    accentAlt: "#9333ea",
  },
  site: {
    baseUrl: "https://aiyaan-inventory-management.vercel.app",
    exclude: ["/api/**", "/admin/**", "/dashboard/**", "/login", "/register"],
    maxPages: 400,
  },
  persona: {
    suggestions: ["What do you offer?", "How do I get started?"],
  },
  db: {
    dialect: "postgres",
    query: async (sql, params) => {
      const result = await getPool().query(sql, params ?? [])
      return result.rows
    },
    execute: async (sql, params) => {
      await getPool().query(sql, params ?? [])
    },
  },
})
