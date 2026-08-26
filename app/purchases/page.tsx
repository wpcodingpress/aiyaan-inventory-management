"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/app-layout";
import ActionMenu from "@/components/ui/action-menu";
import Pagination from "@/components/ui/pagination";
import Modal from "@/components/ui/modal";
import { formatCurrency, getStatusColor } from "@/lib/utils";

interface Purchase {
  id: string;
  purchaseNumber: string;
  supplier: string;
  date: string;
  itemCount: number;
  total: number;
  paid: number;
  due: number;
  paymentStatus: string;
  status: string;
}

export default function PurchasesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);

  const statuses = ["all", "Draft", "Completed", "Cancelled"];
  const limit = 10;

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/purchases?${params}`);
      const data = await res.json();
      setPurchases(data.purchases ?? data.data ?? []);
      setTotalPages(data.totalPages ?? Math.ceil((data.total ?? 0) / limit));
      setTotal(data.total ?? 0);
    } catch {
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, limit]);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  useEffect(() => { setPage(1); }, [statusFilter]);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this purchase?")) return;
    try {
      await fetch(`/api/purchases/${id}`, { method: "DELETE" });
      fetchPurchases();
    } catch { /* empty */ }
  };

  const getPaymentBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "partial": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "unpaid": return "bg-rose-50 text-rose-700 border border-rose-200";
      default: return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

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
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Loading purchases...
                      </div>
                    </td>
                  </tr>
                ) : purchases.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-400">
                      No purchases found.
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{purchase.purchaseNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{purchase.supplier}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{purchase.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">{purchase.itemCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(purchase.total)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatCurrency(purchase.paid)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(purchase.due)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadge(purchase.paymentStatus)}`}>
                          {purchase.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(purchase.status.toLowerCase())}`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionMenu
                          items={[
                            { label: "View Details", icon: "visibility", onClick: () => setViewPurchase(purchase) },
                            { label: "Edit", icon: "edit", onClick: () => { window.location.href = `/purchases/new?id=${purchase.id}`; } },
                            { label: "Cancel Purchase", icon: "cancel", onClick: () => handleCancel(purchase.id), variant: "danger" },
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
            showingCount={purchases.length}
            itemName="purchases"
          />
        </div>
      </div>

      <Modal isOpen={!!viewPurchase} onClose={() => setViewPurchase(null)} title="Purchase Details" size="lg">
        {viewPurchase && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Purchase #</p>
                <p className="text-sm text-gray-900 font-medium">{viewPurchase.purchaseNumber}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Supplier</p>
                <p className="text-sm text-gray-900">{viewPurchase.supplier}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Date</p>
                <p className="text-sm text-gray-900">{viewPurchase.date}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Items</p>
                <p className="text-sm text-gray-900">{viewPurchase.itemCount}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                <p className="text-sm text-gray-900 font-semibold">{formatCurrency(viewPurchase.total)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Paid</p>
                <p className="text-sm text-gray-900">{formatCurrency(viewPurchase.paid)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Due</p>
                <p className="text-sm text-gray-900 font-semibold">{formatCurrency(viewPurchase.due)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Payment Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadge(viewPurchase.paymentStatus)}`}>
                  {viewPurchase.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewPurchase.status.toLowerCase())}`}>
                  {viewPurchase.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
