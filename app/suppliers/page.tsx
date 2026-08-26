"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/app-layout";
import ActionMenu from "@/components/ui/action-menu";
import Pagination from "@/components/ui/pagination";
import Modal from "@/components/ui/modal";
import { formatCurrency, getStatusColor } from "@/lib/utils";

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  totalPurchases: number;
  totalSpent: number;
  outstanding: number;
  rating: number;
  status: string;
}

const emptyForm = { name: "", contact: "", email: "", phone: "" };

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [addOpen, setAddOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const limit = 10;

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/suppliers?${params}`);
      const data = await res.json();
      setSuppliers(data.suppliers ?? data.data ?? []);
      setTotalPages(data.totalPages ?? Math.ceil((data.total ?? 0) / limit));
      setTotal(data.total ?? 0);
    } catch {
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);
  useEffect(() => { setPage(1); }, [search]);

  const openAdd = () => { setForm(emptyForm); setError(""); setAddOpen(true); };
  const openEdit = (s: Supplier) => { setForm({ name: s.name, contact: s.contact, email: s.email, phone: s.phone }); setError(""); setEditSupplier(s); };

  const handleSubmit = async (isEdit: boolean, id?: string) => {
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/suppliers/${id}` : "/api/suppliers";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed to save supplier");
      setAddOpen(false);
      setEditSupplier(null);
      fetchSuppliers();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "An error occurred"); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this supplier?")) return;
    try {
      await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
      fetchSuppliers();
    } catch { /* empty */ }
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`material-symbols-outlined text-[16px] ${
              i < full || (i === full && half) ? "text-amber-400" : "text-gray-200"
            }`}
            style={i === full && half ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            star
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <AppLayout title="Suppliers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Manage your supplier relationships and purchase history.</p>
          <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Supplier
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchases</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding Balance</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Loading suppliers...
                      </div>
                    </td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-400">No suppliers found.</td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.contact}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium">{supplier.totalPurchases}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(supplier.totalSpent)}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">
                        <span className={supplier.outstanding > 0 ? "text-rose-600" : "text-gray-900"}>
                          {formatCurrency(supplier.outstanding)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">{renderStars(supplier.rating)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(supplier.status.toLowerCase())}`}>
                          {supplier.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionMenu
                          items={[
                            { label: "View Details", icon: "visibility", onClick: () => setViewSupplier(supplier) },
                            { label: "Edit", icon: "edit", onClick: () => openEdit(supplier) },
                            { label: "Deactivate", icon: "person_off", onClick: () => handleDeactivate(supplier.id), variant: "danger" },
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
            showingCount={suppliers.length}
            itemName="suppliers"
          />
        </div>
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Supplier">
        <div className="space-y-4">
          {error && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Supplier name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
            <input type="text" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Contact person" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Email address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Phone number" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={() => handleSubmit(false)} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Add Supplier"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editSupplier} onClose={() => setEditSupplier(null)} title="Edit Supplier">
        {editSupplier && (
          <div className="space-y-4">
            {error && <p className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
              <input type="text" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button onClick={() => setEditSupplier(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => handleSubmit(true, editSupplier.id)} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!viewSupplier} onClose={() => setViewSupplier(null)} title="Supplier Details" size="lg">
        {viewSupplier && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Supplier Name</p>
                <p className="text-sm text-gray-900 font-medium">{viewSupplier.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Contact Person</p>
                <p className="text-sm text-gray-900">{viewSupplier.contact}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                <p className="text-sm text-gray-900">{viewSupplier.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                <p className="text-sm text-gray-900">{viewSupplier.phone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total Purchases</p>
                <p className="text-sm text-gray-900 font-medium">{viewSupplier.totalPurchases}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total Spent</p>
                <p className="text-sm text-gray-900 font-semibold">{formatCurrency(viewSupplier.totalSpent)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Outstanding Balance</p>
                <p className={`text-sm font-semibold ${viewSupplier.outstanding > 0 ? "text-rose-600" : "text-gray-900"}`}>{formatCurrency(viewSupplier.outstanding)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Rating</p>
                {renderStars(viewSupplier.rating)}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewSupplier.status.toLowerCase())}`}>{viewSupplier.status}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
