"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/app-layout";
import ActionMenu from "@/components/ui/action-menu";
import Pagination from "@/components/ui/pagination";
import Modal from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";

interface Expense {
  id: string;
  date: string;
  category: string;
  title: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  status: string;
}

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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const limit = 10;

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (activeCategory !== "All") params.set("category", activeCategory);
      const res = await fetch(`/api/expenses?${params}`);
      const data = await res.json();
      setExpenses(data.expenses ?? data.data ?? []);
      setTotalPages(data.totalPages ?? Math.ceil((data.total ?? 0) / limit));
      setTotal(data.total ?? 0);
      setTotalAmount(data.totalAmount ?? data.summary?.total ?? 0);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, limit]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);
  useEffect(() => { setPage(1); }, [activeCategory]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      fetchExpenses();
    } catch { /* empty */ }
  };

  return (
    <AppLayout title="Expenses">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Track and manage business expenses.</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              Total: {formatCurrency(totalAmount)}
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Loading expenses...
                      </div>
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">No expenses found.</td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">{expense.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[expense.category] ?? "bg-gray-50 text-gray-700 border border-gray-200"}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{expense.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(expense.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{expense.paymentMethod}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{expense.reference}</td>
                      <td className="px-6 py-4 text-center">
                        <ActionMenu
                          items={[
                            { label: "Edit", icon: "edit", onClick: () => { window.location.href = `/expenses/new?id=${expense.id}`; } },
                            { label: "Duplicate", icon: "content_copy", onClick: () => { window.location.href = `/expenses/new?duplicate=${expense.id}`; } },
                            { label: "Delete", icon: "delete", onClick: () => handleDelete(expense.id), variant: "danger" },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            showingCount={expenses.length}
            itemName="expenses"
          />
        </div>
      </div>
    </AppLayout>
  );
}
