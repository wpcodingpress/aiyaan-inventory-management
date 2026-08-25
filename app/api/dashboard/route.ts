import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    const organizationId = org?.id ?? "default-org";

    const [
      totalProducts,
      totalVariants,
      stockAgg,
      revenueAgg,
      cogsAgg,
      expensesAgg,
      recentSales,
      lowStockVariants,
      outOfStockCount,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.product.count({ where: { organizationId, status: "active" } }),
      prisma.productVariant.count({
        where: { product: { organizationId, status: "active" } },
      }),
      prisma.productVariant.aggregate({
        where: { product: { organizationId, status: "active" } },
        _sum: { currentStock: true },
      }),
      prisma.sale.aggregate({
        where: { organizationId, status: "completed" },
        _sum: { total: true },
      }),
      prisma.saleItem.aggregate({
        where: { sale: { organizationId, status: "completed" } },
        _sum: { costAtSale: true, quantity: true },
      }),
      prisma.expense.aggregate({
        where: { organizationId },
        _sum: { amount: true },
      }),
      prisma.sale.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { name: true } },
          items: { select: { quantity: true } },
        },
      }),
      prisma.productVariant.findMany({
        where: {
          product: { organizationId, status: "active" },
          minimumStock: { gt: 0 },
        },
        include: { product: { select: { name: true } } },
      }),
      prisma.productVariant.count({
        where: {
          product: { organizationId, status: "active" },
          currentStock: 0,
        },
      }),
      prisma.sale.findMany({
        where: { organizationId, status: "completed" },
        select: { total: true, createdAt: true },
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.total ?? 0);
    const totalCogs = Number(cogsAgg._sum.costAtSale ?? 0);
    const grossProfit = totalRevenue - totalCogs;
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const totalExpenses = Number(expensesAgg._sum.amount ?? 0);
    const netProfit = grossProfit - totalExpenses;
    const totalStock = Number(stockAgg._sum.currentStock ?? 0);

    const inventoryVariants = await prisma.productVariant.findMany({
      where: { product: { organizationId, status: "active" } },
      select: { purchaseCost: true, currentStock: true },
    });
    const inventoryValue = inventoryVariants.reduce(
      (sum, v) => sum + Number(v.purchaseCost) * v.currentStock,
      0
    );

    const lowStockAlertsList = lowStockVariants
      .filter((v) => v.currentStock > 0 && v.currentStock <= v.minimumStock)
      .sort((a, b) => a.currentStock - b.currentStock)
      .slice(0, 5);
    const lowStockCount = lowStockVariants.filter(
      (v) => v.currentStock > 0 && v.currentStock <= v.minimumStock
    ).length;

    const monthMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      monthMap[key] = 0;
    }
    monthlyRevenue.forEach((sale) => {
      const d = new Date(sale.createdAt);
      const key = d.toLocaleString("en-US", { month: "short", year: "2-digit" });
      if (key in monthMap) {
        monthMap[key] += Number(sale.total ?? 0);
      }
    });
    const chartData = Object.entries(monthMap).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    return NextResponse.json({
      totalRevenue,
      totalCogs,
      grossProfit,
      grossMargin,
      totalExpenses,
      netProfit,
      totalProducts,
      totalVariants,
      totalStock,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
      recentSales: recentSales.map((s) => ({
        id: s.id,
        orderId: s.saleNumber,
        customer: s.customer?.name ?? "Walk-in",
        items: s.items.reduce((sum, i) => sum + i.quantity, 0),
        amount: Number(s.total),
        status: s.status,
        createdAt: s.createdAt,
      })),
      lowStockAlerts: lowStockAlertsList.map((v) => ({
        id: v.id,
        name: v.product.name,
        variant: [v.size, v.color, v.material].filter(Boolean).join(" / ") || v.sku,
        currentStock: v.currentStock,
        minimumStock: v.minimumStock,
      })),
      chartData,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
