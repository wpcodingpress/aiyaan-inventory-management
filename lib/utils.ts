import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(amount: number, currencySymbol: string = "৳"): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  return `${currencySymbol}${formatted}`
}

export function formatCurrencyShort(amount: number, currencySymbol: string = "৳"): string {
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
