"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useRouter } from "next/navigation";

const categories = ["Rent", "Utilities", "Marketing", "Salaries", "Transportation", "Office Supplies", "Other"];
const paymentMethods = ["Cash", "Credit Card", "Bank Transfer", "Cheque"];

export default function AddExpensePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    category: "",
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "",
    reference: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/expenses");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to create expense:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Add Expense">
      <div className="max-w-2xl mx-auto">
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
            Expense created successfully!
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Category</label>
              <select name="category" value={form.category} onChange={handleChange} required className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Title</label>
              <input name="title" value={form.title} onChange={handleChange} required placeholder="Expense title" className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Amount (৳)</label>
              <input name="amount" type="number" step="0.01" min="0" value={form.amount} onChange={handleChange} required placeholder="0.00" className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} required className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Payment Method</label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none">
                <option value="">Select method</option>
                {paymentMethods.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Reference</label>
              <input name="reference" value={form.reference} onChange={handleChange} placeholder="Invoice/Receipt #" className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Optional notes..." className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <a href="/expenses" className="px-5 py-2.5 border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors">
              Cancel
            </a>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary-container text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
