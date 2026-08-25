"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

interface LineItem {
  id: number;
  productId: string;
  variantId: string;
  quantity: number;
  sellingPrice: number;
  cost: number;
  discount: number;
  tax: number;
  total: number;
  profit: number;
  currentStock: number;
}

const productOptions = [
  { id: "p1", name: "Premium Leather Loafer", sku: "PLL-001", cost: 2200, price: 4900, stock: 120 },
  { id: "p2", name: "Urban Casual Sneaker", sku: "UCS-002", cost: 1800, price: 3200, stock: 85 },
  { id: "p3", name: "Classic Formal Shoe", sku: "CFS-003", cost: 2000, price: 2850, stock: 200 },
  { id: "p4", name: "Sport Running Shoe", sku: "SRS-004", cost: 1500, price: 2600, stock: 45 },
  { id: "p5", name: "Suede Chelsea Boot", sku: "SCB-005", cost: 2500, price: 4500, stock: 60 },
];

const customerOptions = [
  { id: "c1", name: "Bata Retailers Ltd.", type: "Wholesale Partner" },
  { id: "c2", name: "Apex Footwear", type: "Distributor" },
  { id: "c3", name: "Lotto Outlets", type: "Retail Chain" },
  { id: "c4", name: "Walkers & Co.", type: "Retail" },
  { id: "c5", name: "Shoe Gallery", type: "Boutique" },
];

export default function CreateSalePage() {
  const [customerId, setCustomerId] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, productId: "", variantId: "", quantity: 1, sellingPrice: 0, cost: 0, discount: 0, tax: 0, total: 0, profit: 0, currentStock: 0 },
  ]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const updateLineItem = (id: number, field: keyof LineItem, value: number | string) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.total = updated.quantity * updated.sellingPrice - updated.discount + updated.tax;
        updated.profit = (updated.sellingPrice - updated.cost) * updated.quantity;
        return updated;
      })
    );
  };

  const selectProduct = (id: number, productId: string) => {
    const product = productOptions.find((p) => p.id === productId);
    if (!product) return;
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          productId,
          sellingPrice: product.price,
          cost: product.cost,
          currentStock: product.stock,
          total: item.quantity * product.price - item.discount + item.tax,
          profit: (product.price - product.cost) * item.quantity,
        };
      })
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: Date.now(), productId: "", variantId: "", quantity: 1, sellingPrice: 0, cost: 0, discount: 0, tax: 0, total: 0, profit: 0, currentStock: 0 },
    ]);
  };

  const removeLineItem = (id: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredProducts = productOptions.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
  const totalDiscount = lineItems.reduce((sum, item) => sum + item.discount, 0);
  const totalTax = lineItems.reduce((sum, item) => sum + item.tax, 0);
  const grandTotal = subtotal - totalDiscount + totalTax;
  const dueAmount = grandTotal - paidAmount;
  const totalProfit = lineItems.reduce((sum, item) => sum + item.profit, 0);

  const paymentStatus = dueAmount <= 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Unpaid";
  const hasInsufficientStock = lineItems.some(
    (item) => item.productId && item.quantity > item.currentStock
  );

  return (
    <AppLayout title="New Sale">
      <div className="space-y-6 max-w-6xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Sale Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <div className="flex gap-2">
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                >
                  <option value="">Select customer...</option>
                  {customerOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
                <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#4f46e5] hover:bg-gray-50 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sale Date *</label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Line Items</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none w-64"
                />
              </div>
              <button
                onClick={addLineItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#4f46e5] hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Item
              </button>
            </div>
          </div>

          {hasInsufficientStock && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-rose-600">warning</span>
              <span className="text-sm text-rose-700 font-medium">
                Insufficient stock detected. Please adjust quantities before completing the sale.
              </span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Product / Variant</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-20">Stock</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-24">Qty</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-28">Selling Price</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-28">Cost</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-24">Discount</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-24">Tax</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-32">Total</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-28">Profit</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lineItems.map((item) => {
                  const insufficient = item.productId && item.quantity > item.currentStock;
                  return (
                    <tr key={item.id} className={insufficient ? "bg-rose-50" : ""}>
                      <td className="py-3 pr-4">
                        <select
                          value={item.productId}
                          onChange={(e) => selectProduct(item.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                        >
                          <option value="">Select product...</option>
                          {filteredProducts.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                          ))}
                        </select>
                        {insufficient && (
                          <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">error</span>
                            Insufficient stock ({item.currentStock} available)
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span className={`text-sm font-medium ${insufficient ? "text-rose-600" : item.currentStock <= 10 ? "text-amber-600" : "text-gray-900"}`}>
                          {item.currentStock || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-lg text-sm text-right focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none ${insufficient ? "border-rose-300 bg-rose-50" : "border-gray-200"}`}
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={0}
                          value={item.sellingPrice || ""}
                          onChange={(e) => updateLineItem(item.id, "sellingPrice", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right text-gray-600">
                          ৳{item.cost.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={0}
                          value={item.discount || ""}
                          onChange={(e) => updateLineItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={0}
                          value={item.tax || ""}
                          onChange={(e) => updateLineItem(item.id, "tax", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                        />
                      </td>
                      <td className="py-3 pr-4 text-sm text-right font-medium text-gray-900">
                        ৳{item.total.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-sm text-right font-medium text-emerald-600">
                        {item.productId ? `৳${item.profit.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length <= 1}
                          className="text-gray-400 hover:text-rose-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                <input
                  type="number"
                  min={0}
                  value={paidAmount || ""}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Amount</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900">
                  ৳{Math.max(0, dueAmount).toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      paymentStatus === "Paid"
                        ? "bg-emerald-50 text-emerald-700"
                        : paymentStatus === "Partial"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-rose-600">-৳{totalDiscount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-900">৳{totalTax.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">৳{grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Profit</span>
                <span className="font-medium text-emerald-600">৳{totalProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            Save as Draft
          </button>
          <button
            disabled={hasInsufficientStock}
            className="px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px] mr-1 align-text-bottom">check_circle</span>
            Complete Sale
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
