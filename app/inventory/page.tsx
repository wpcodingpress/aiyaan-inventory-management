"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/app-layout";
import ActionMenu from "@/components/ui/action-menu";
import Pagination from "@/components/ui/pagination";
import Modal from "@/components/ui/modal";
import { formatCurrency } from "@/lib/utils";

interface InventoryItem {
  id: string;
  product: string;
  variant: string;
  sku: string;
  currentStock: number;
  minLevel: number;
  value: number;
  status: string;
}

interface InventoryStats {
  totalUnits: number;
  inventoryCost: number;
  retailValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  productCount: number;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<InventoryStats>({ totalUnits: 0, inventoryCost: 0, retailValue: 0, lowStockCount: 0, outOfStockCount: 0, productCount: 0 });

  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [saving, setSaving] = useState(false);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [history, setHistory] = useState<{ date: string; type: string; quantity: number; reference: string }[]>([]);

  const limit = 10;

  const statusParam = activeTab === "low" ? "lowStock" : activeTab === "incoming" ? "incoming" : undefined;

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusParam) params.set("status", statusParam);
      const res = await fetch(`/api/inventory?${params}`);
      const data = await res.json();
      setItems(data.items ?? data.inventory ?? data.data ?? []);
      setTotalPages(data.totalPages ?? Math.ceil((data.total ?? 0) / limit));
      setTotal(data.total ?? 0);
      if (data.stats) setStats(data.stats);
      else if (data.summary) setStats(data.summary);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusParam, limit]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);
  useEffect(() => { setPage(1); }, [activeTab]);

  const handleExportCSV = () => {
    const headers = ["Product", "Variant", "SKU", "Current Stock", "Min Level", "Value", "Status"];
    const rows = items.map((i) => [i.product, i.variant, i.sku, i.currentStock, i.minLevel, i.value, i.status]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-valuation-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdjustSubmit = async () => {
    if (!adjustItem || !adjustQty) return;
    setSaving(true);
    try {
      await fetch(`/api/inventory/${adjustItem.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: Number(adjustQty), reason: adjustReason }),
      });
      setAdjustItem(null);
      setAdjustQty("");
      setAdjustReason("");
      fetchInventory();
    } catch { /* empty */ }
    finally { setSaving(false); }
  };

  const handleBulkAdjust = async () => {
    if (!bulkData.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/inventory/bulk-adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustments: bulkData }),
      });
      setBulkOpen(false);
      setBulkData("");
      fetchInventory();
    } catch { /* empty */ }
    finally { setSaving(false); }
  };

  const fetchHistory = async (item: InventoryItem) => {
    setHistoryItem(item);
    try {
      const res = await fetch(`/api/inventory/${item.id}/history`);
      const data = await res.json();
      setHistory(data.history ?? data.data ?? []);
    } catch {
      setHistory([]);
    }
  };

  const tabs = [
    { id: "all", label: "All Stock" },
    { id: "low", label: `Low Stock Alerts (${stats.lowStockCount})` },
    { id: "incoming", label: "Incoming Shipments" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In Stock": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Low Stock": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Out of Stock": return "bg-rose-50 text-rose-700 border border-rose-200";
      default: return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getRowClass = (status: string) => {
    if (status === "Low Stock") return "bg-amber-50/30";
    if (status === "Out of Stock") return "bg-rose-50/30";
    return "";
  };

  return (
    <AppLayout title="Inventory Command Center">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mt-1">Manage stock levels, valuations, and replenishment alerts.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Valuation Report
            </button>
            <button onClick={() => setBulkOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Bulk Stock Adjustment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Units</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUnits.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">across {stats.productCount} products</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory Cost</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.inventoryCost)}</p>
            <p className="text-xs text-gray-400 mt-1">total investment</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Retail Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.retailValue)}</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">+80% markup</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-amber-400">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{stats.lowStockCount}</p>
            <p className="text-xs text-gray-400 mt-1">need attention</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-rose-400">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-bold text-rose-600 mt-2">{stats.outOfStockCount}</p>
            <p className="text-xs text-gray-400 mt-1">critical</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex gap-0 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Min Level</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Value (Cost)</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Loading inventory...
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">No items found for this filter.</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className={`${getRowClass(item.status)} hover:bg-gray-50/50 transition-colors`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.variant}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{item.currentStock}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{item.minLevel}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(item.value)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionMenu
                          items={[
                            { label: "Adjust Stock", icon: "tune", onClick: () => { setAdjustItem(item); setAdjustQty(""); setAdjustReason(""); } },
                            { label: "View History", icon: "history", onClick: () => fetchHistory(item) },
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
            showingCount={items.length}
            itemName="items"
          />
        </div>
      </div>

      <Modal isOpen={!!adjustItem} onClose={() => setAdjustItem(null)} title={`Adjust Stock - ${adjustItem?.product ?? ""}`}>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Current Stock: <span className="font-semibold text-gray-900">{adjustItem?.currentStock}</span></p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Quantity</label>
            <input type="number" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Positive to add, negative to remove" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <input type="text" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Reason for adjustment" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setAdjustItem(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleAdjustSubmit} disabled={saving || !adjustQty} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Apply Adjustment"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={bulkOpen} onClose={() => setBulkOpen(false)} title="Bulk Stock Adjustment" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Enter JSON array of adjustments: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">[{"{ \"sku\": \"...\", \"quantity\": 10, \"reason\": \"...\" }"}]</code></p>
          <textarea
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-40"
            placeholder='[{"sku":"OXF-TAN-42","quantity":50,"reason":"Restock"}]'
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button onClick={() => setBulkOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
            <button onClick={handleBulkAdjust} disabled={saving || !bulkData.trim()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Apply Adjustments"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!historyItem} onClose={() => { setHistoryItem(null); setHistory([]); }} title={`Stock History - ${historyItem?.product ?? ""}`} size="lg">
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No history found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Date</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Type</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Quantity</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((h, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-600">{h.date}</td>
                      <td className="py-2 px-3 text-gray-900">{h.type}</td>
                      <td className={`py-2 px-3 text-right font-medium ${h.quantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>{h.quantity > 0 ? "+" : ""}{h.quantity}</td>
                      <td className="py-2 px-3 text-gray-500 font-mono">{h.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </AppLayout>
  );
}
