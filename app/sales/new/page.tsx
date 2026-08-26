"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  customerType: string;
}

interface ProductVariant {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  size: string | null;
  color: string | null;
  material: string | null;
  purchaseCost: number;
  sellingPrice: number;
  currentStock: number;
}

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

export default function CreateSalePage() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, productId: "", variantId: "", quantity: 1, sellingPrice: 0, cost: 0, discount: 0, tax: 0, total: 0, profit: 0, currentStock: 0 },
  ]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<ProductVariant[]>([]);

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    fetch("/api/customers?limit=100")
      .then((r) => r.json())
      .then((data) => setCustomers(data.items || []))
      .catch(() => {});

    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((data) => {
        const variants: ProductVariant[] = [];
        (data.products || []).forEach((p: any) => {
          if (p.variants) {
            p.variants.forEach((v: any) => {
              variants.push({
                id: v.id,
                productId: p.id,
                productName: p.name,
                sku: v.sku || p.sku,
                size: v.size,
                color: v.color,
                material: v.material,
                purchaseCost: Number(v.purchaseCost) || 0,
                sellingPrice: Number(v.sellingPrice) || 0,
                currentStock: v.currentStock || 0,
              });
            });
          }
        });
        setProducts(variants);
      })
      .catch(() => {});
  }, []);

  const handleAddCustomer = async () => {
    if (!newCustomer.name) return;
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      if (res.ok) {
        const created = await res.json();
        setCustomers((prev) => [...prev, { id: created.id, name: created.name, customerType: created.customerType || "individual" }]);
        setCustomerId(created.id);
        setNewCustomer({ name: "", email: "", phone: "" });
        setShowAddCustomer(false);
      }
    } catch (err) {
      console.error("Failed to create customer:", err);
    }
  };

  const variantLabel = (v: ProductVariant) => {
    const parts = [v.productName];
    if (v.color) parts.push(v.color);
    if (v.size) parts.push(v.size);
    if (v.material) parts.push(v.material);
    return `${parts.join(" - ")} (${v.sku})`;
  };

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

  const selectProduct = (id: number, variantId: string) => {
    const variant = products.find((v) => v.id === variantId);
    if (!variant) return;
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          productId: variant.productId,
          variantId: variant.id,
          sellingPrice: variant.sellingPrice,
          cost: variant.purchaseCost,
          currentStock: variant.currentStock,
          total: item.quantity * variant.sellingPrice - item.discount + item.tax,
          profit: (variant.sellingPrice - variant.purchaseCost) * item.quantity,
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

  const filteredProducts = products.filter(
    (p) =>
      p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    (item) => item.variantId && item.quantity > item.currentStock
  );

  const handleSubmit = async (status: "draft" | "completed") => {
    if (lineItems.every((i) => !i.variantId)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId || null,
          paidAmount,
          notes,
          status,
          items: lineItems
            .filter((i) => i.variantId)
            .map((i) => ({
              variantId: i.variantId,
              quantity: i.quantity,
              sellingPrice: i.sellingPrice,
              discount: i.discount,
              tax: i.tax,
            })),
        }),
      });
      if (res.ok) {
        router.push("/sales");
      }
    } catch (err) {
      console.error("Failed to create sale:", err);
    } finally {
      setSaving(false);
    }
  };

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
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.customerType})</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(!showAddCustomer)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-[#4f46e5] hover:bg-gray-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </button>
              </div>
              {showAddCustomer && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                  <input
                    type="text"
                    placeholder="Customer name *"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={handleAddCustomer} className="px-3 py-1.5 bg-[#4f46e5] text-white rounded-lg text-xs font-medium hover:bg-[#4338ca] transition-colors">
                      Add Customer
                    </button>
                    <button type="button" onClick={() => setShowAddCustomer(false)} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
                  const insufficient = item.variantId && item.quantity > item.currentStock;
                  return (
                    <tr key={item.id} className={insufficient ? "bg-rose-50" : ""}>
                      <td className="py-3 pr-4">
                        <select
                          value={item.variantId}
                          onChange={(e) => selectProduct(item.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
                        >
                          <option value="">Select product...</option>
                          {filteredProducts.map((p) => (
                            <option key={p.id} value={p.id}>{variantLabel(p)}</option>
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
                          {item.variantId ? item.currentStock : "—"}
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
                          {formatCurrency(item.cost)}
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
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-3 pr-4 text-sm text-right font-medium text-emerald-600">
                        {item.variantId ? formatCurrency(item.profit) : "—"}
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
                  {formatCurrency(Math.max(0, dueAmount))}
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
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-rose-600">-{formatCurrency(totalDiscount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-900">{formatCurrency(totalTax)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Profit</span>
                <span className="font-medium text-emerald-600">{formatCurrency(totalProfit)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => handleSubmit("draft")}
            disabled={saving}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={() => handleSubmit("completed")}
            disabled={hasInsufficientStock || saving}
            className="px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[16px] mr-1 align-text-bottom">check_circle</span>
            {saving ? "Saving..." : "Complete Sale"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
