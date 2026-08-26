import { type ClassValue, clsx } from "clsx"
import { DEFAULT_CURRENCY_SYMBOL } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number, currencySymbol: string = DEFAULT_CURRENCY_SYMBOL): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  return `${currencySymbol}${formatted}`
}

export function formatCurrencyShort(amount: number, currencySymbol: string = DEFAULT_CURRENCY_SYMBOL): string {
  if (amount >= 1000000) {
    return `${currencySymbol}${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${currencySymbol}${(amount / 1000).toFixed(0)}k`
  }
  return `${currencySymbol}${amount.toFixed(0)}`
}

export function calculateProfit(sellingPrice: number, costAtSale: number, quantity: number): number {
  return (sellingPrice - costAtSale) * quantity
}

export function calculateMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0
  return ((revenue - cost) / revenue) * 100
}

export function formatDate(date: Date | string, format: string = "DD/MM/YYYY"): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return format.replace('DD', day).replace('MM', month).replace('YYYY', String(year))
}

export function generateNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count).padStart(4, '0')}`
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "completed":
    case "paid":
    case "active":
    case "inStock":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200"
    case "pending":
    case "partial":
    case "draft":
    case "lowStock":
      return "bg-amber-50 text-amber-700 border border-amber-200"
    case "cancelled":
    case "unpaid":
    case "inactive":
    case "outOfStock":
    case "overdue":
      return "bg-rose-50 text-rose-700 border border-rose-200"
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200"
  }
}

export function getPaymentStatusBadge(status: string): string {
  switch (status) {
    case "paid": return "bg-emerald-50 text-emerald-700 border border-emerald-200"
    case "partial": return "bg-amber-50 text-amber-700 border border-amber-200"
    case "unpaid": return "bg-rose-50 text-rose-700 border border-rose-200"
    default: return "bg-gray-50 text-gray-700 border border-gray-200"
  }
}
