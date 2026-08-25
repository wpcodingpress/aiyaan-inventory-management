"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

const sampleExpenses = [
  { id: "1", date: "2024-07-01", category: "Rent", title: "Office & Warehouse Rent", amount: 45000, paymentMethod: "Bank Transfer", reference: "INV-2024-071", status: "Paid" },
  { id: "2", date: "2024-07-05", category: "Utilities", title: "Electricity & Internet", amount: 12000, paymentMethod: "Cash", reference: "UTL-2024-005", status: "Paid" },
  { id: "3", date: "2024-07-15", category: "Marketing", title: "Digital Marketing Campaign", amount: 25000, paymentMethod: "Credit Card", reference: "MKT-2024-012", status: "Paid" },
  { id: "4", date: "2024-07-20", category: "Salaries", title: "Staff Salaries - July", amount: 85000, paymentMethod: "Bank Transfer", reference: "SAL-2024-07", status: "Paid" },
];

const categoryColors: Record<string, string> = {
  Rent: "bg-blue-50 text-blue-700 border border-blue-200",
  Utilities: "bg-amber-50 text-amber-700 border border-amber-200",
  Marketing: "bg-purple-50 text-purple-700 border border-purple-200",
  Salaries: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Transportation: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  "Office Supplies": "bg-gray-50 text-gray-700 border border-gray-200",
  Other: "bg-rose-50 text-rose-700 border border-rose-200",
};

const categories = ["All", "Rent", "Utilities", "Marketing", "Salaries", "Transportation", "Office Supplies", "Other"];

export default function ExpensesPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? sampleExpenses
      : sampleExpenses.filter((e) => e.category === activeCategory);

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <AppLayout title="Expenses">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Track and manage business expenses.</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              Total: ৳{totalAmount.toLocaleString()}
            </p>
          </div>
          <a
            href="/expenses/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Expense
          </a>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-500 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No expenses found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{expense.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[expense.category] ?? "bg-gray-50 text-gray-700 border border-gray-200"}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{expense.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">৳{expense.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{expense.paymentMethod}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{expense.reference}</td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {filtered.length} of {filtered.length} expenses
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
