"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

const sampleInventory = [
  { product: "Classic Oxford Brogue", variant: "Tan / 42", sku: "OXF-TAN-42", currentStock: 145, minLevel: 50, value: 319000, status: "In Stock", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200", rowClass: "" },
  { product: "Suede Chelsea Boot", variant: "Navy / 44", sku: "CHL-NVY-44", currentStock: 18, minLevel: 25, value: 45000, status: "Low Stock", statusColor: "bg-amber-50 text-amber-700 border-amber-200", rowClass: "bg-amber-50/30" },
  { product: "Leather Loafer", variant: "Black / 41", sku: "LFR-BLK-41", currentStock: 88, minLevel: 30, value: 176000, status: "In Stock", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200", rowClass: "" },
  { product: "Handstitched Monk Strap", variant: "Oxblood / 43", sku: "MNK-OXB-43", currentStock: 0, minLevel: 15, value: 0, status: "Out of Stock", statusColor: "bg-rose-50 text-rose-700 border-rose-200", rowClass: "bg-rose-50/30" },
  { product: "Minimalist Sneaker", variant: "White / 42", sku: "SNK-WHT-42", currentStock: 210, minLevel: 100, value: 315000, status: "In Stock", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200", rowClass: "" },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("all");

  const totalUnits = sampleInventory.reduce((sum, i) => sum + i.currentStock, 0);
  const inventoryCost = sampleInventory.reduce((sum, i) => sum + i.value, 0);
  const retailValue = Math.round(inventoryCost * 1.8);
  const lowStockCount = sampleInventory.filter((i) => i.status === "Low Stock").length;
  const outOfStockCount = sampleInventory.filter((i) => i.status === "Out of Stock").length;

  const tabs = [
    { id: "all", label: "All Stock" },
    { id: "low", label: `Low Stock Alerts (${lowStockCount})` },
    { id: "incoming", label: "Incoming Shipments" },
  ];

  const filteredItems =
    activeTab === "low"
      ? sampleInventory.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock")
      : activeTab === "incoming"
        ? []
        : sampleInventory;

  return (
    <AppLayout title="Inventory Command Center">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mt-1">
              Manage stock levels, valuations, and replenishment alerts.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Valuation Report
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Bulk Stock Adjustment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Units</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalUnits.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">across 5 products</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory Cost</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">৳{inventoryCost.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">total investment</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Retail Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">৳{retailValue.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">+80% markup</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-amber-400">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{lowStockCount}</p>
            <p className="text-xs text-gray-400 mt-1">need attention</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 border-l-4 border-l-rose-400">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Out of Stock</p>
            <p className="text-2xl font-bold text-rose-600 mt-2">{outOfStockCount}</p>
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
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      No items found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.sku} className={`${item.rowClass} hover:bg-gray-50/50 transition-colors`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.variant}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">{item.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{item.currentStock}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 text-right">{item.minLevel}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">৳{item.value.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </td>
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
              Showing {filteredItems.length} of {filteredItems.length} items
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
