import { defineMiku } from "@wpcodingpress/miku/config"
import { Pool } from "pg"
import { inventoryTools } from "./miku.tools"

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
    name: "Aiyaan's Footwear",
    assistantName: "MIKU",
    tagline: "Ask us anything",
    accent: "#df071c",
    accentAlt: "#9333ea",
  },
  site: {
    baseUrl: "https://aiyaan-inventory-management.vercel.app",
    exclude: ["/api/**", "/admin/**", "/dashboard/**", "/login", "/register"],
    maxPages: 400,
  },
  persona: {
    suggestions: [
      "Do you have running shoes in size 42?",
      "Which items are running low on stock?",
      "How many products do you have?",
    ],
    canDo: [
      "Search the catalogue and report live prices, sizes, colours and materials",
      "Check whether a specific item is in stock",
      "Summarise stock levels and list items that need reordering",
    ],
    extraInstructions: [
      "This is a private inventory application, so the public site has no crawlable pages: an empty SITE KNOWBASE section is expected and is not a reason to refuse.",
      "For every question about products, prices, sizes, colours, stock or inventory, call one of the inventory tools (search_products, check_stock, list_categories, low_stock_products, stock_summary) BEFORE answering.",
      "The inventory tools read live data from the company database and their results are the source of truth. If a question mentions 'nothing on this website matches', that only refers to crawled pages — still call a tool.",
      "If the tools return no match, say so plainly and suggest a nearby alternative; never invent a product, price or stock figure.",
    ],
  },
  tools: inventoryTools,
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
