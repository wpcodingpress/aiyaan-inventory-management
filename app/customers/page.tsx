"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/app-layout";
import ActionMenu from "@/components/ui/action-menu";
import Pagination from "@/components/ui/pagination";
import Modal from "@/components/ui/modal";
import { formatCurrency, getStatusColor } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  totalSpent: number;
  outstanding: number;
  totalSales: number;
  status: string;
}

const typeColors: Record<string, string> = {
  Wholesale: "bg-blue-50 text-blue-700 border border-blue-200",
  Distributor: "bg-purple-50 text-purple-700 border border-purple-200",
  "Retail Chain": "bg-teal-50 text-teal-700 border border-teal-200",
  Retail: "bg-amber-50 text-amber-700 border border-amber-200",
  Individual: "bg-gray-50 text-gray-700 border border-gray-200",
};

const emptyForm = { name: "", email: "", phone: "", type: "Wholesale" };

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const limit = 10;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/customers?${params}`);
      const data = await res.json();
      setCustomers(data.customers ?? data.data ?? []);
      setTotalPages(data.totalPages ?? Math.ceil((data.total ?? 0) / limit));
      setTotal(data.total ?? 0);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, limit]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { setPage(1); }, [searchQuery]);

  const openAdd = () => { setForm(emptyForm); setError(""); setAddOpen(true); };
  const openEdit = (c: Customer) => { setForm({ name: c.name, email: c.email, phone: c.phone, type: c.type }); setError(""); setEditCustomer(c); };

  const handleSubmit = async (isEdit: boolean, id?: string) => {
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/customers/${id}` : "/api/customers";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed to save customer");
      setAddOpen(false);
      setEditCustomer(null);
      fetchCustomers();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "An error occurred"); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this customer?")) return;
    try {
      await fetch(`/api/customers/${id}`, { method: "DELETE" });
      fetchCustomers();
    } catch { /* empty */ }
  };

  return (
    <AppLayout title="Customers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Manage your customer accounts and outstanding balances.</p>
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Customer
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Loading customers...
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-400">No customers found.</td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#4f46e5]/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-[#4f46e5]">
                              {customer.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[customer.type] || typeColors.Individual}`}>
                          {customer.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(customer.totalSpent)}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">
                        <span className={customer.outstanding > 0 ? "text-rose-600" : "text-gray-600"}>
                          {formatCurrency(customer.outstanding)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">{customer.totalSales}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.status.toLowerCase())}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionMenu
                          items={[
                            { label: "View Details", icon: "visibility", onClick: () => setViewCustomer(customer) },
                            { label: "Edit", icon: "edit", onClick: () => openEdit(customer) },
                            { label: "Deactivate", icon: "person_off", onClick: () => handleDeactivate(customer.id), variant: "danger" },
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
            showingCount={customers.length}
            itemName="customers"
          />
        </div>
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Customer">
        <div className="space-y-4">
          {error && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none" placeholder="Customer name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none" placeholder="Email address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none" placeholder="Phone number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none">
              {Object.keys(typeColors).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={() => handleSubmit(false)} disabled={saving} className="px-4 py-2 bg-[#4f46e5] text-white rounded-lg text-sm font-medium hover:bg-[#4338ca] transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Add Customer"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editCustomer} onClose={() => setEditCustomer(null)} title="Edit Customer">
        {editCustomer && (
          <div className="space-y-4">
            {error && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none">
                {Object.keys(typeColors).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button onClick={() => setEditCustomer(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => handleSubmit(true, editCustomer.id)} disabled={saving} className="px-4 py-2 bg-[#4f46e5] text-white rounded-lg text-sm font-medium hover:bg-[#4338ca] transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!viewCustomer} onClose={() => setViewCustomer(null)} title="Customer Details" size="lg">
        {viewCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Name</p>
                <p className="text-sm text-gray-900 font-medium">{viewCustomer.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                <p className="text-sm text-gray-900">{viewCustomer.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                <p className="text-sm text-gray-900">{viewCustomer.phone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Type</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[viewCustomer.type] || typeColors.Individual}`}>{viewCustomer.type}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total Spent</p>
                <p className="text-sm text-gray-900 font-semibold">{formatCurrency(viewCustomer.totalSpent)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Outstanding</p>
                <p className={`text-sm font-semibold ${viewCustomer.outstanding > 0 ? "text-rose-600" : "text-gray-900"}`}>{formatCurrency(viewCustomer.outstanding)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total Sales</p>
                <p className="text-sm text-gray-900">{viewCustomer.totalSales}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewCustomer.status.toLowerCase())}`}>{viewCustomer.status}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
