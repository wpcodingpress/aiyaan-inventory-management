/**
 * Live inventory tools for MIKU.
 *
 * Aiyaan's Footwear is a private inventory application: its products, prices and
 * stock live behind login in the host's own database, so MIKU cannot learn them
 * by crawling the public site. These tools hand that data to MIKU at answer
 * time instead, which is the intended pattern for a data-backed app.
 *
 * The Prisma client is imported lazily, inside each tool, so importing this file
 * (which the `miku ingest` CLI does on CI) never constructs a database client.
 */
import { bool, num, obj, readTool, str } from "@wpcodingpress/miku/tools"

async function db() {
  const { prisma } = await import("@/lib/prisma")
  return prisma
}

/** Prisma returns a Decimal for money; the model wants a plain number. */
function toNumber(value: unknown): number {
  if (typeof value === "number") return value
  const asString =
    value && typeof value === "object" && "toString" in value
      ? (value as { toString(): string }).toString()
      : String(value)
  const n = Number(asString)
  return Number.isFinite(n) ? n : 0
}

function availability(stock: number, minimum: number): string {
  if (stock <= 0) return "out of stock"
  if (stock <= minimum) return "low stock"
  return "in stock"
}

export const inventoryTools = [
  readTool({
    name: "search_products",
    kind: "catalog",
    description:
      "Search the live product catalogue — names, prices, sizes, colours, materials and stock. Use this for any question about what this business sells, what something costs, or whether an item is available. The results are read straight from the company database and are the source of truth.",
    parameters: obj(
      {
        query: str(
          "Words from the product name, SKU or description. Leave empty to browse the catalogue."
        ),
        category: str("Restrict to one category, for example 'Sneakers' or 'Sandals'."),
        inStockOnly: bool("When true, only return products that currently have stock."),
        limit: num("How many products to return. Defaults to 10, maximum 25."),
      },
      []
    ),
    execute: async (args: {
      query?: string
      category?: string
      inStockOnly?: boolean
      limit?: number
    }) => {
      const prisma = await db()
      const query = (args.query ?? "").trim()
      const category = (args.category ?? "").trim()
      const limit = Math.min(Math.max(Math.floor(Number(args.limit) || 10), 1), 25)

      const rows = await prisma.product.findMany({
        where: {
          status: "active",
          ...(query
            ? {
                OR: [
                  { name: { contains: query } },
                  { sku: { contains: query } },
                  { description: { contains: query } },
                ],
              }
            : {}),
          ...(category ? { category: { name: { contains: category } } } : {}),
        },
        include: {
          category: true,
          brand: true,
          variants: { where: { status: "active" }, orderBy: { size: "asc" } },
        },
        orderBy: { name: "asc" },
        take: 50,
      })

      const matched = args.inStockOnly
        ? rows.filter((p) => p.variants.some((v) => v.currentStock > 0))
        : rows
      const products = matched.slice(0, limit).map((p) => ({
        name: p.name,
        sku: p.sku,
        category: p.category?.name ?? null,
        brand: p.brand?.name ?? null,
        description: p.description ? p.description.slice(0, 240) : null,
        variants: p.variants.map((v) => ({
          sku: v.sku,
          size: v.size,
          color: v.color,
          material: v.material,
          price: toNumber(v.sellingPrice),
          stock: v.currentStock,
          availability: availability(v.currentStock, v.minimumStock),
        })),
      }))

      return {
        query: query || null,
        category: category || null,
        count: products.length,
        products,
      }
    },
  }),

  readTool({
    name: "check_stock",
    kind: "catalog",
    description:
      "Check the live stock of a specific product by name, SKU or barcode, returning the stock for each size and colour. Use this when the visitor asks whether a particular item is available.",
    parameters: obj(
      {
        product: str("The product name, or an exact SKU / barcode / variant SKU."),
      },
      ["product"]
    ),
    execute: async (args: { product: string }) => {
      const term = (args.product ?? "").trim()
      if (!term) return { found: false, message: "No product was given." }

      const prisma = await db()
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: term } },
            { sku: { equals: term } },
            { barcode: { equals: term } },
            { variants: { some: { sku: { equals: term } } } },
          ],
        },
        include: {
          category: true,
          variants: { where: { status: "active" }, orderBy: { size: "asc" } },
        },
        take: 5,
      })

      if (products.length === 0) {
        return {
          found: false,
          message: `No product matches "${term}". Try search_products to find similar items.`,
        }
      }

      return {
        found: true,
        products: products.map((p) => ({
          name: p.name,
          sku: p.sku,
          category: p.category?.name ?? null,
          variants: p.variants.map((v) => ({
            sku: v.sku,
            size: v.size,
            color: v.color,
            price: toNumber(v.sellingPrice),
            stock: v.currentStock,
            availability: availability(v.currentStock, v.minimumStock),
          })),
        })),
      }
    },
  }),

  readTool({
    name: "list_categories",
    kind: "catalog",
    description:
      "List the product categories this business sells, with how many products are in each. Use this for a 'what do you sell?' or 'what categories do you have?' question.",
    parameters: obj({}, []),
    execute: async () => {
      const prisma = await db()
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      })
      return {
        count: categories.length,
        categories: categories.map((c) => ({
          name: c.name,
          description: c.description,
          products: c._count.products,
        })),
      }
    },
  }),

  readTool({
    name: "low_stock_products",
    kind: "catalog",
    description:
      "List the variants that are at or below their minimum stock level, lowest first. Use this for re-stocking questions such as 'what needs reordering?' or 'what is running low?'. Read-only.",
    parameters: obj(
      {
        limit: num("How many results to return. Defaults to 15, maximum 50."),
      },
      []
    ),
    execute: async (args: { limit?: number }) => {
      const limit = Math.min(Math.max(Math.floor(Number(args.limit) || 15), 1), 50)
      const prisma = await db()
      const variants = await prisma.productVariant.findMany({
        where: { status: "active" },
        include: { product: { select: { name: true, sku: true } } },
        take: 500,
      })

      const low = variants
        .filter((v) => v.currentStock <= v.minimumStock)
        .sort(
          (a, b) =>
            a.currentStock - a.minimumStock - (b.currentStock - b.minimumStock)
        )
        .slice(0, limit)
        .map((v) => ({
          product: v.product.name,
          productSku: v.product.sku,
          variantSku: v.sku,
          size: v.size,
          color: v.color,
          stock: v.currentStock,
          minimum: v.minimumStock,
          shortfall: Math.max(v.minimumStock - v.currentStock, 0),
        }))

      return { count: low.length, lowStock: low }
    },
  }),

  readTool({
    name: "stock_summary",
    kind: "catalog",
    description:
      "A high-level snapshot of the whole inventory: number of active products, total stock units, how many variants are out of stock or low, and the retail value of stock on hand. Use this for 'how is our inventory?' style questions.",
    parameters: obj({}, []),
    execute: async () => {
      const prisma = await db()
      const [products, variants] = await Promise.all([
        prisma.product.count({ where: { status: "active" } }),
        prisma.productVariant.findMany({
          where: { status: "active" },
          select: { currentStock: true, minimumStock: true, sellingPrice: true },
        }),
      ])

      const totalUnits = variants.reduce((sum, v) => sum + v.currentStock, 0)
      const retailValue = variants.reduce(
        (sum, v) => sum + v.currentStock * toNumber(v.sellingPrice),
        0
      )

      return {
        products,
        variants: variants.length,
        totalUnits,
        outOfStock: variants.filter((v) => v.currentStock <= 0).length,
        lowStock: variants.filter(
          (v) => v.currentStock > 0 && v.currentStock <= v.minimumStock
        ).length,
        retailValueOnHand: Math.round(retailValue),
      }
    },
  }),
]

export default inventoryTools
