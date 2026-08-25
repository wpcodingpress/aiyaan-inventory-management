"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardData {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  grossMargin: number;
  totalExpenses: number;
  netProfit: number;
  totalProducts: number;
  totalVariants: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
  inventoryValue: number;
  recentSales: Array<{
    id: string;
    orderId: string;
    customer: string;
    items: number;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  lowStockAlerts: Array<{
    id: string;
    name: string;
    variant: string;
    currentStock: number;
    minimumStock: number;
  }>;
  chartData: Array<{ month: string; revenue: number }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch {
      console.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (val: number) =>
    `₹${val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  const kpis = data
    ? [
        {
          label: "Total Revenue",
          value: formatCurrency(data.totalRevenue),
          icon: "payments",
          trend: "+12.5%",
          trendUp: true,
          bg: "bg-blue-50",
          iconColor: "text-blue-600",
        },
        {
          label: "Gross Profit",
          value: formatCurrency(data.grossProfit),
          icon: "trending_up",
          trend: `${data.grossMargin.toFixed(1)}% margin`,
          trendUp: true,
          bg: "bg-emerald-50",
          iconColor: "text-emerald-600",
        },
        {
          label: "Inventory Value",
          value: formatCurrency(data.inventoryValue),
          icon: "warehouse",
          trend: `${data.totalVariants} variants`,
          trendUp: true,
          bg: "bg-purple-50",
          iconColor: "text-purple-600",
        },
        {
          label: "Low Stock Items",
          value: data.lowStockCount.toString(),
          icon: "warning",
          trend: `${data.outOfStockCount} out of stock`,
          trendUp: false,
          bg: "bg-rose-50",
          iconColor: "text-rose-600",
          isError: true,
        },
      ]
    : [];

  const chartData =
    data?.chartData ?? [
      { month: "Jan", revenue: 120000 },
      { month: "Feb", revenue: 98000 },
      { month: "Mar", revenue: 145000 },
      { month: "Apr", revenue: 132000 },
      { month: "May", revenue: 168000 },
      { month: "Jun", revenue: 155000 },
    ];

  const alerts =
    data?.lowStockAlerts ?? [
      { id: "1", name: "Premium Leather Loafer", variant: "Size 9 / Brown", currentStock: 2, minimumStock: 10 },
      { id: "2", name: "Classic Oxford", variant: "Size 10 / Black", currentStock: 4, minimumStock: 15 },
      { id: "3", name: "Suede Chukka", variant: "Size 8 / Tan", currentStock: 1, minimumStock: 8 },
    ];

  const sales =
    data?.recentSales ?? [
      { id: "1", orderId: "ORD-001", customer: "Rahul Mehta", items: 3, amount: 11400, status: "completed", createdAt: new Date().toISOString() },
      { id: "2", orderId: "ORD-002", customer: "Priya Sharma", items: 1, amount: 4200, status: "completed", createdAt: new Date().toISOString() },
      { id: "3", orderId: "ORD-003", customer: "Walk-in", items: 2, amount: 6900, status: "completed", createdAt: new Date().toISOString() },
    ];

  const salesStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  return (
    <AppLayout title="Business Overview">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-[var(--outline-variant,#e0e0e0)] p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                  <div className="h-8 bg-gray-200 rounded w-32" />
                </div>
              ))
            : kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className={`bg-white rounded-xl border border-[var(--outline-variant,#e0e0e0)] p-5 ${
                    kpi.isError ? "ring-1 ring-rose-200" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[var(--on-surface-variant,#666)]">
                      {kpi.label}
                    </span>
                    <div className={`${kpi.bg} p-2 rounded-lg`}>
                      <span className={`material-symbols-outlined text-xl ${kpi.iconColor}`}>
                        {kpi.icon}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[var(--on-surface,#1a1a1a)]">
                    {kpi.value}
                  </div>
                  <div
                    className={`mt-1 text-xs font-medium ${
                      kpi.trendUp ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {kpi.trend}
                  </div>
                </div>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[var(--outline-variant,#e0e0e0)] p-5">
            <h3 className="text-lg font-semibold text-[var(--on-surface,#1a1a1a)] mb-4">
              Financial Overview
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#666", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#666", fontSize: 12 }}
                    tickFormatter={(val: number) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `₹${Number(value).toLocaleString("en-IN")}`,
                      "Revenue",
                    ]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e0e0e0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#6750a4"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[var(--outline-variant,#e0e0e0)] p-5">
            <h3 className="text-lg font-semibold text-[var(--on-surface,#1a1a1a)] mb-4">
              Inventory Alerts
            </h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100"
                >
                  <span className="material-symbols-outlined text-amber-600 mt-0.5">
                    warning
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--on-surface,#1a1a1a)] truncate">
                      {alert.name}
                    </div>
                    <div className="text-xs text-[var(--on-surface-variant,#666)]">
                      {alert.variant}
                    </div>
                    <div className="text-xs font-medium text-amber-700 mt-1">
                      {alert.currentStock} left (min: {alert.minimumStock})
                    </div>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-6 text-[var(--on-surface-variant,#999)]">
                  <span className="material-symbols-outlined text-3xl block mb-1">check_circle</span>
                  All stock levels healthy
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[var(--outline-variant,#e0e0e0)] p-5">
          <h3 className="text-lg font-semibold text-[var(--on-surface,#1a1a1a)] mb-4">
            Recent Sales
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--outline-variant,#e0e0e0)]">
                  <th className="text-left px-4 py-2 text-sm font-medium text-[var(--on-surface-variant,#666)]">
                    Order ID
                  </th>
                  <th className="text-left px-4 py-2 text-sm font-medium text-[var(--on-surface-variant,#666)]">
                    Customer
                  </th>
                  <th className="text-left px-4 py-2 text-sm font-medium text-[var(--on-surface-variant,#666)]">
                    Items
                  </th>
                  <th className="text-right px-4 py-2 text-sm font-medium text-[var(--on-surface-variant,#666)]">
                    Amount
                  </th>
                  <th className="text-center px-4 py-2 text-sm font-medium text-[var(--on-surface-variant,#666)]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-[var(--outline-variant,#e0e0e0)] last:border-b-0 hover:bg-[var(--surface-container-low,#fafafa)] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-mono text-[var(--primary,#6750a4)]">
                      {sale.orderId}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--on-surface,#1a1a1a)]">
                      {sale.customer}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--on-surface-variant,#666)]">
                      {sale.items}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--on-surface,#1a1a1a)] text-right">
                      {formatCurrency(sale.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${salesStatusStyle(
                          sale.status
                        )}`}
                      >
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
