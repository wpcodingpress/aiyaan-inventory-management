"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

const samplePurchases = [
  { id: "1", purchaseNumber: "PO-2024-001", supplier: "Premium Leather Goods Co.", date: "2024-06-15", itemCount: 3, total: 165000, paid: 165000, due: 0, paymentStatus: "Paid", status: "Completed" },
  { id: "2", purchaseNumber: "PO-2024-002", supplier: "BD Leather Exports", date: "2024-07-02", itemCount: 2, total: 98000, paid: 50000, due: 48000, paymentStatus: "Partial", status: "Completed" },
  { id: "3", purchaseNumber: "PO-2024-003", supplier: "Footwear Manufacturers Ltd.", date: "2024-07-20", itemCount: 4, total: 220000, paid: 0, due: 220000, paymentStatus: "Unpaid", status: "Draft" },
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

export default function PurchasesPage() {
  const [statusFilter, setStatusFilter] = useState("all");

  const statuses = ["all", "Draft", "Completed", "Cancelled"];
  const filtered =
    statusFilter === "all"
      ? samplePurchases
      : samplePurchases.filter((p) => p.status === statusFilter);

  return (
    <AppLayout title="Purchases">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Manage your purchase orders and supplier transactions.</p>
          <a
            href="/purchases/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Purchase
          </a>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-500 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase #</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{purchase.purchaseNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{purchase.supplier}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{purchase.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{purchase.itemCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">৳{purchase.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">৳{purchase.paid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">৳{purchase.due.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[purchase.paymentStatus]}`}>
                        {purchase.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[purchase.status]}`}>
                        {purchase.status}
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
              Showing {filtered.length} of {filtered.length} purchases
            </p>
            <div className="flex gap-1">
              <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed" disabled>Previous</button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">1</button>
              <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
