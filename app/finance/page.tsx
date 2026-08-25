"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const monthlyRevenue = [
  { month: "Jan", revenue: 420000, profit: 168000 },
  { month: "Feb", revenue: 380000, profit: 142000 },
  { month: "Mar", revenue: 510000, profit: 204000 },
  { month: "Apr", revenue: 470000, profit: 178000 },
  { month: "May", revenue: 550000, profit: 225000 },
  { month: "Jun", revenue: 620000, profit: 260000 },
  { month: "Jul", revenue: 590000, profit: 243000 },
];

const sampleProfitability = [
  { product: "Urban Casual Sneaker", unitsSold: 120, avgCost: 1800, sellingPrice: 3200, revenue: 384000, totalCost: 216000, profit: 168000, margin: 43.7 },
  { product: "Leather Oxford Pro", unitsSold: 85, avgCost: 3500, sellingPrice: 6500, revenue: 552500, totalCost: 297500, profit: 255000, margin: 46.1 },
  { product: "Runner Mesh V2", unitsSold: 210, avgCost: 1200, sellingPrice: 1950, revenue: 409500, totalCost: 252000, profit: 157500, margin: 38.4 },
  { product: "Suede Loafer Classic", unitsSold: 45, avgCost: 2100, sellingPrice: 2900, revenue: 130500, totalCost: 94500, profit: 36000, margin: 27.5 },
];

function getMarginColor(margin: number) {
  if (margin > 40) return "text-emerald-600";
  if (margin >= 30) return "text-amber-600";
  return "text-rose-600";
}

function getMarginBadge(margin: number) {
  if (margin > 40) return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (margin >= 30) return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-rose-50 text-rose-700 border border-rose-200";
}

export default function FinancePage() {
  const [dateFilter] = useState("This Month");

  return (
    <AppLayout title="Finance & P&L">
      <div className="space-y-6">
        <div>
          <p className="text-gray-500 text-sm">Financial Intelligence</p>
          <h2 className="text-xl font-bold text-gray-900 mt-1">Revenue & Cost Management</h2>
        </div>

        <div className="flex items-center justify-between">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            {dateFilter}
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export P&L
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-[24px]">account_balance_wallet</span>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">৳280,000</p>
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +12%
              </span>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden">
              <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-rose-600 text-[24px]">receipt_long</span>
              </div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Operating Expenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">৳120,000</p>
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="material-symbols-outlined text-[14px]">trending_down</span>
                -4%
              </span>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Margin</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">38.5%</p>
              <div className="mt-3 w-full bg-gray-100 rounded-xl h-3 overflow-hidden">
                <div className="bg-primary h-full rounded-xl" style={{ width: "38.5%" }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Target: 40%</p>
            </div>
          </div>

          <div className="col-span-8 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue vs Profit Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                    formatter={(value) => [`৳${Number(value).toLocaleString()}`, undefined]}
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
                    {sampleProfitability.map((item) => (
                      <tr key={item.product} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.unitsSold}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">৳{item.avgCost.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">৳{item.sellingPrice.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">৳{item.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 text-right">৳{item.totalCost.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-emerald-600 text-right font-medium">৳{item.profit.toLocaleString()}</td>
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
      </div>
    </AppLayout>
  );
}
