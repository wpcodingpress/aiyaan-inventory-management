import { NextResponse } from "next/server";

export async function GET() {
  try {
    const totalRevenue = 1476500;
    const totalCogs = 908500;
    const grossProfit = totalRevenue - totalCogs;
    const grossMargin = parseFloat(((grossProfit / totalRevenue) * 100).toFixed(1));
    const totalExpenses = 120000;
    const netProfit = grossProfit - totalExpenses;

    const productProfitability = [
      { product: "Urban Casual Sneaker", unitsSold: 120, avgCost: 1800, sellingPrice: 3200, revenue: 384000, totalCost: 216000, profit: 168000, margin: 43.7 },
      { product: "Leather Oxford Pro", unitsSold: 85, avgCost: 3500, sellingPrice: 6500, revenue: 552500, totalCost: 297500, profit: 255000, margin: 46.1 },
      { product: "Runner Mesh V2", unitsSold: 210, avgCost: 1200, sellingPrice: 1950, revenue: 409500, totalCost: 252000, profit: 157500, margin: 38.4 },
      { product: "Suede Loafer Classic", unitsSold: 45, avgCost: 2100, sellingPrice: 2900, revenue: 130500, totalCost: 94500, profit: 36000, margin: 27.5 },
    ];

    const monthlyRevenue = [
      { month: "Jan", revenue: 420000, profit: 168000 },
      { month: "Feb", revenue: 380000, profit: 142000 },
      { month: "Mar", revenue: 510000, profit: 204000 },
      { month: "Apr", revenue: 470000, profit: 178000 },
      { month: "May", revenue: 550000, profit: 225000 },
      { month: "Jun", revenue: 620000, profit: 260000 },
      { month: "Jul", revenue: 590000, profit: 243000 },
    ];

    return NextResponse.json({
      totalRevenue,
      totalCogs,
      grossProfit,
      grossMargin,
      totalExpenses,
      netProfit,
      productProfitability,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Finance API error:", error);
    return NextResponse.json({ error: "Failed to fetch financial data" }, { status: 500 });
  }
}
