"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/app-layout";
import ActionMenu from "@/components/ui/action-menu";
import Pagination from "@/components/ui/pagination";
import Modal from "@/components/ui/modal";
import { formatCurrency, getStatusColor } from "@/lib/utils";

interface Sale {
  id: string;
  saleNumber: string;
  customer: string;
  customerType?: string;
  date: string;
  itemCount: number;
  total: number;
  paid: number;
  due: number;
  paymentStatus: string;
  status: string;
}

export default function SalesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewSale, setViewSale] = useState<Sale | null>(null);

  const statuses = ["all", "Paid", "Partial", "Unpaid"];
  const limit = 10;

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter !== "all") params.set("paymentStatus", statusFilter);
      if (dateFrom) params.set("startDate", dateFrom);
      if (dateTo) params.set("endDate", dateTo);
      const res = await fetch(`/api/sales?${params}`);
      const data = await res.json();
      setSales(data.sales ?? data.data ?? []);
      setTotalPages(data.totalPages ?? Math.ceil((data.total ?? 0) / limit));
      setTotal(data.total ?? 0);
    } catch {
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo, limit]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  useEffect(() => { setPage(1); }, [statusFilter, dateFrom, dateTo]);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this sale?")) return;
    try {
      await fetch(`/api/sales/${id}`, { method: "DELETE" });
      fetchSales();
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
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Loading sales...
                      </div>
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-400">
                      No sales found.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#4f46e5]">{sale.saleNumber}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{sale.customer}</div>
                        {sale.customerType && <div className="text-xs text-gray-500">{sale.customerType}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{sale.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">{sale.itemCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(sale.total)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatCurrency(sale.paid)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(sale.due)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadge(sale.paymentStatus)}`}>
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.status.toLowerCase())}`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionMenu
                          items={[
                            { label: "View Details", icon: "visibility", onClick: () => setViewSale(sale) },
                            { label: "Edit", icon: "edit", onClick: () => { window.location.href = `/sales/new?id=${sale.id}`; } },
                            { label: "Cancel Sale", icon: "cancel", onClick: () => handleCancel(sale.id), variant: "danger" },
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
            showingCount={sales.length}
            itemName="sales"
          />
        </div>
      </div>

      <Modal isOpen={!!viewSale} onClose={() => setViewSale(null)} title="Sale Details" size="lg">
        {viewSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Sale #</p>
                <p className="text-sm text-gray-900 font-medium">{viewSale.saleNumber}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Customer</p>
                <p className="text-sm text-gray-900">{viewSale.customer}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Date</p>
                <p className="text-sm text-gray-900">{viewSale.date}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Items</p>
                <p className="text-sm text-gray-900">{viewSale.itemCount}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
                <p className="text-sm text-gray-900 font-semibold">{formatCurrency(viewSale.total)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Paid</p>
                <p className="text-sm text-gray-900">{formatCurrency(viewSale.paid)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Due</p>
                <p className="text-sm text-gray-900 font-semibold">{formatCurrency(viewSale.due)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Payment Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadge(viewSale.paymentStatus)}`}>
                  {viewSale.paymentStatus}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewSale.status.toLowerCase())}`}>
                  {viewSale.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
