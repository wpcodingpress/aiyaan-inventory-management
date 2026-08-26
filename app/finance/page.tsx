"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/app-layout";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FinanceData {
  summary: {
    netProfit: number;
    netProfitChange: number;
    operatingExpenses: number;
    operatingExpensesChange: number;
    grossMargin: number;
  };
  monthlyRevenue: { month: string; revenue: number; profit: number }[];
  productProfitability: {
    product: string;
    unitsSold: number;
    avgCost: number;
    sellingPrice: number;
    revenue: number;
    totalCost: number;
    profit: number;
    margin: number;
  }[];
}

function getMarginBadge(margin: number) {
  if (margin > 40) return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (margin >= 30) return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-rose-50 text-rose-700 border border-rose-200";
}

const periods = [
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "thisQuarter", label: "This Quarter" },
  { id: "thisYear", label: "This Year" },
];

export default function FinancePage() {
  const [period, setPeriod] = useState("thisMonth");
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFinance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finance?period=${period}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchFinance(); }, [fetchFinance]);

  const summary = data?.summary;
  const chartData = data?.monthlyRevenue ?? [];
  const profitability = data?.productProfitability ?? [];

  return (
    <AppLayout title="Finance & P&L">
      <div className="space-y-6">
        <div>
          <p className="text-gray-500 text-sm">Financial Intelligence</p>
          <h2 className="text-xl font-bold text-gray-900 mt-1">Revenue & Cost Management</h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-500 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              Loading financial data...
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-4 space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600 text-[24px]">account_balance_wallet</span>
                  </div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary?.netProfit ?? 0)}</p>
                  <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${(summary?.netProfitChange ?? 0) >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                    <span className="material-symbols-outlined text-[14px]">{(summary?.netProfitChange ?? 0) >= 0 ? "trending_up" : "trending_down"}</span>
                    {summary?.netProfitChange ?? 0}%
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-rose-600 text-[24px]">receipt_long</span>
                  </div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Operating Expenses</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary?.operatingExpenses ?? 0)}</p>
                  <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${(summary?.operatingExpensesChange ?? 0) <= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                    <span className="material-symbols-outlined text-[14px]">{(summary?.operatingExpensesChange ?? 0) <= 0 ? "trending_down" : "trending_up"}</span>
                    {summary?.operatingExpensesChange ?? 0}%
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Margin</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{summary?.grossMargin ?? 0}%</p>
                  <div className="mt-3 w-full bg-gray-100 rounded-xl h-3 overflow-hidden">
                    <div className="bg-primary h-full rounded-xl" style={{ width: `${summary?.grossMargin ?? 0}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Target: 40%</p>
                </div>
              </div>

              <div className="col-span-8 space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue vs Profit Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                        formatter={(value) => [formatCurrency(Number(value)), undefined]}
                      />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Product Profitability</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Cost</th>
                          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                          <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                          <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Margin %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {profitability.map((item) => (
                          <tr key={item.product} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.unitsSold}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatCurrency(item.avgCost)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(item.sellingPrice)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.revenue)}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatCurrency(item.totalCost)}</td>
                            <td className="px-6 py-4 text-sm text-emerald-600 text-right font-medium">{formatCurrency(item.profit)}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMarginBadge(item.margin)}`}>
                                {item.margin}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
