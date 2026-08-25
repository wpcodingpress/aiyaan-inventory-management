"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

const sampleSales = [
  { id: "1", saleNumber: "SO-2024-001", customer: "Bata Retailers Ltd.", customerType: "Wholesale Partner", date: "2024-07-10", items: "Premium Leather Loafer (x50)", itemCount: 3, total: 245000, paid: 245000, due: 0, paymentStatus: "Paid", status: "Completed" },
  { id: "2", saleNumber: "SO-2024-002", customer: "Apex Footwear", customerType: "Distributor", date: "2024-07-18", items: "Urban Casual Sneaker (x120)", itemCount: 2, total: 310000, paid: 200000, due: 110000, paymentStatus: "Partial", status: "Completed" },
  { id: "3", saleNumber: "SO-2024-003", customer: "Lotto Outlets", customerType: "Retail Chain", date: "2024-07-25", items: "Classic Formal Shoe (x30)", itemCount: 1, total: 85500, paid: 0, due: 85500, paymentStatus: "Unpaid", status: "Completed" },
];

const paymentStatusColors: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Partial: "bg-amber-50 text-amber-700 border border-amber-200",
  Unpaid: "bg-rose-50 text-rose-700 border border-rose-200",
};

const statusColors: Record<string, string> = {
  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Draft: "bg-amber-50 text-amber-700 border border-amber-200",
  Cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
};

export default function SalesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const statuses = ["all", "Paid", "Partial", "Unpaid"];
  const filtered = sampleSales.filter((s) => {
    if (statusFilter !== "all" && s.paymentStatus !== statusFilter) return false;
    if (dateFrom && s.date < dateFrom) return false;
    if (dateTo && s.date > dateTo) return false;
    return true;
  });

  return (
    <AppLayout title="Sales">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Manage your sales orders and customer transactions.</p>
          <a
            href="/sales/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Sale
          </a>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === s
                        ? "bg-[#4f46e5] text-white"
                        : "text-gray-500 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-500">From:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                />
                <span className="text-sm text-gray-500">To:</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sale #</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total (৳)</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#4f46e5]">{sale.saleNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{sale.customer}</div>
                      <div className="text-xs text-gray-500">{sale.customerType}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sale.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{sale.itemCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">৳{sale.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">৳{sale.paid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">৳{sale.due.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[sale.paymentStatus]}`}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[sale.status]}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {filtered.length} of {sampleSales.length} sales
            </p>
            <div className="flex gap-1">
              <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed" disabled>Previous</button>
              <button className="px-3 py-1 text-sm bg-[#4f46e5] text-white rounded">1</button>
              <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
