import { NextRequest, NextResponse } from "next/server";

const reportData: Record<string, unknown> = {
  "sales-summary": {
    totalRevenue: 585600,
    totalSales: 68,
    averageOrderValue: 8611.76,
    topProducts: [
      { name: "Classic Leather Sandal", unitsSold: 85, revenue: 76500 },
      { name: "Urban Canvas Sneaker", unitsSold: 62, revenue: 74400 },
      { name: "Sport Pro Runner", unitsSold: 45, revenue: 72000 },
      { name: "Executive Formal Shoe", unitsSold: 28, revenue: 67200 },
      { name: "Leather Belt Premium", unitsSold: 120, revenue: 48000 },
    ],
    monthlyTrend: [
      { month: "Apr", revenue: 480000 },
      { month: "May", revenue: 510000 },
      { month: "Jun", revenue: 495000 },
      { month: "Jul", revenue: 520000 },
      { month: "Aug", revenue: 585600 },
    ],
  },
  "purchase-summary": {
    totalPurchases: 843000,
    totalOrders: 42,
    averagePurchaseValue: 20071.43,
    topSuppliers: [
      { name: "Footwear Components Ltd", orders: 8, total: 320000 },
      { name: "Leather Masters BD", orders: 12, total: 185000 },
      { name: "Sole Makers Co", orders: 6, total: 210000 },
      { name: "Textile Source Inc", orders: 10, total: 95000 },
      { name: "Artisan Supply House", orders: 6, total: 33000 },
    ],
  },
  "inventory-valuation": {
    totalUnits: 1185,
    totalCostValue: 575000,
    totalRetailValue: 1046500,
    overallMargin: "45.1%",
    byCategory: [
      { category: "Sandals", units: 320, costValue: 144000, retailValue: 240000 },
      { category: "Sneakers", units: 180, costValue: 117000, retailValue: 216000 },
      { category: "Formal Shoes", units: 95, costValue: 114000, retailValue: 209000 },
      { category: "Sports Shoes", units: 140, costValue: 119000, retailValue: 224000 },
      { category: "Accessories", units: 450, costValue: 81000, retailValue: 157500 },
    ],
  },
  "profit-loss": {
    revenue: 585600,
    costOfGoodsSold: 312000,
    grossProfit: 273600,
    grossMargin: "46.7%",
    operatingExpenses: 85000,
    netProfit: 188600,
    netMargin: "32.2%",
    expenseBreakdown: [
      { category: "Rent & Utilities", amount: 35000 },
      { category: "Staff Salaries", amount: 28000 },
      { category: "Marketing", amount: 8500 },
      { category: "Transportation", amount: 6200 },
      { category: "Office Supplies", amount: 3800 },
      { category: "Miscellaneous", amount: 3500 },
    ],
  },
  "stock-movement": {
    period: "This Month",
    movements: {
      stockIn: { purchase: 42, returns: 5, totalUnits: 2935 },
      stockOut: { sales: 68, damage: 3, totalUnits: 1932 },
      adjustments: 7,
      netChange: "+150",
    },
    topMovers: [
      { product: "Leather Belt Premium", ins: 200, outs: 120 },
      { product: "Classic Leather Sandal", ins: 120, outs: 85 },
      { product: "Urban Canvas Sneaker", ins: 80, outs: 62 },
      { product: "Sport Pro Runner", ins: 60, outs: 45 },
    ],
  },
  "product-profitability": {
    products: [
      { name: "Classic Leather Sandal", revenue: 76500, cost: 38250, profit: 38250, margin: "50.0%" },
      { name: "Urban Canvas Sneaker", revenue: 74400, cost: 37200, profit: 37200, margin: "50.0%" },
      { name: "Sport Pro Runner", revenue: 72000, cost: 38250, profit: 33750, margin: "46.9%" },
      { name: "Executive Formal Shoe", revenue: 67200, cost: 33600, profit: 33600, margin: "50.0%" },
      { name: "Leather Belt Premium", revenue: 48000, cost: 21600, profit: 26400, margin: "55.0%" },
      { name: "Canvas Slip-On", revenue: 32000, cost: 17600, profit: 14400, margin: "45.0%" },
    ],
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!type) {
    return NextResponse.json(
      { error: "Report type is required. Use ?type=<report-type>" },
      { status: 400 }
    );
  }

  const data = reportData[type];
  if (!data) {
    return NextResponse.json(
      { error: `Unknown report type: ${type}. Available: ${Object.keys(reportData).join(", ")}` },
      { status: 404 }
    );
  }

  return NextResponse.json({ type, data });
}
