export const APP_NAME = "Inventory Management Platform"
export const DEFAULT_CURRENCY = "BDT"
export const DEFAULT_CURRENCY_SYMBOL = "৳"

export const MOVEMENT_TYPES = {
  PURCHASE: "PURCHASE",
  SALE: "SALE",
  SALE_RETURN: "SALE_RETURN",
  PURCHASE_RETURN: "PURCHASE_RETURN",
  ADJUSTMENT_IN: "ADJUSTMENT_IN",
  ADJUSTMENT_OUT: "ADJUSTMENT_OUT",
  DAMAGE: "DAMAGE",
  LOSS: "LOSS",
  OPENING_STOCK: "OPENING_STOCK",
} as const

export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PARTIAL: "partial",
  PAID: "paid",
} as const

export const ENTITY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
  DISCONTINUED: "discontinued",
} as const

export const SIDEBAR_NAV = [
  { path: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/products", label: "Products", icon: "inventory_2" },
  { path: "/inventory", label: "Inventory", icon: "warehouse" },
  { path: "/purchases", label: "Purchases", icon: "shopping_cart" },
  { path: "/sales", label: "Sales", icon: "sell" },
  { path: "/customers", label: "Customers", icon: "group" },
  { path: "/suppliers", label: "Suppliers", icon: "factory" },
  { path: "/finance", label: "Finance", icon: "payments" },
  { path: "/expenses", label: "Expenses", icon: "receipt_long" },
  { path: "/reports", label: "Reports", icon: "analytics" },
  { path: "/settings", label: "Settings", icon: "settings" },
] as const

export const PERMISSIONS = {
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_DELETE: "products.delete",
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_ADJUST: "inventory.adjust",
  PURCHASES_VIEW: "purchases.view",
  PURCHASES_CREATE: "purchases.create",
  SALES_VIEW: "sales.view",
  SALES_CREATE: "sales.create",
  FINANCE_VIEW: "finance.view",
  EXPENSES_VIEW: "expenses.view",
  EXPENSES_CREATE: "expenses.create",
  REPORTS_VIEW: "reports.view",
  SETTINGS_MANAGE: "settings.manage",
  USERS_MANAGE: "users.manage",
} as const
