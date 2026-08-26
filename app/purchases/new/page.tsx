"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface Supplier {
  id: string;
  name: string;
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
  currentStock: number;
}

interface LineItem {
  id: number;
  variantId: string;
  quantity: number;
  unitCost: number;
  discount: number;
  tax: number;
  total: number;
}

export default function CreatePurchasePage() {
  const router = useRouter();
  const [supplier, setSupplier] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, variantId: "", quantity: 1, unitCost: 0, discount: 0, tax: 0, total: 0 },
  ]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [saving, setSaving] = useState(false);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<ProductVariant[]>([]);

  useEffect(() => {
    fetch("/api/suppliers?limit=100")
      .then((r) => r.json())
      .then((data) => setSuppliers(data.suppliers || []))
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
                currentStock: v.currentStock || 0,
              });
            });
          }
        });
        setProducts(variants);
      })
      .catch(() => {});
  }, []);

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
        if (field === "variantId") {
          const prod = products.find((p) => p.id === value);
          if (prod) updated.unitCost = prod.purchaseCost;
        }
        updated.total = updated.quantity * updated.unitCost - updated.discount + updated.tax;
        return updated;
      })
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: Date.now(), variantId: "", quantity: 1, unitCost: 0, discount: 0, tax: 0, total: 0 },
    ]);
  };

  const removeLineItem = (id: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const totalDiscount = lineItems.reduce((sum, item) => sum + item.discount, 0);
  const totalTax = lineItems.reduce((sum, item) => sum + item.tax, 0);
  const grandTotal = subtotal - totalDiscount + totalTax;
  const dueAmount = grandTotal - paidAmount;

  const handleSubmit = async (status: "draft" | "completed") => {
    if (!supplier || lineItems.every((i) => !i.variantId)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: supplier,
          invoiceNumber,
          purchaseDate,
          notes,
          paidAmount,
          status,
          items: lineItems
            .filter((i) => i.variantId)
            .map((i) => ({
              variantId: i.variantId,
              quantity: i.quantity,
              unitCost: i.unitCost,
              discount: i.discount,
              tax: i.tax,
            })),
        }),
      });
      if (res.ok) {
        router.push("/purchases");
      }
    } catch (err) {
      console.error("Failed to create purchase:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Create Purchase">
      <div className="space-y-6 max-w-5xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Purchase Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Select supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice #</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Enter invoice number"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date *</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Line Items</h3>
            <button
              onClick={addLineItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Product / Variant</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-24">Qty</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-32">Unit Cost</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-28">Discount</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-24">Tax</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider pb-2 w-32">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4">
                      <select
                        value={item.variantId}
                        onChange={(e) => updateLineItem(item.id, "variantId", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Select product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{variantLabel(p)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <input
                        type="number"
                        min={0}
                        value={item.unitCost || ""}
                        onChange={(e) => updateLineItem(item.id, "unitCost", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <input
                        type="number"
                        min={0}
                        value={item.discount || ""}
                        onChange={(e) => updateLineItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <input
                        type="number"
                        min={0}
                        value={item.tax || ""}
                        onChange={(e) => updateLineItem(item.id, "tax", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </td>
                    <td className="py-3 pr-4 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(item.total)}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="space-y-3 max-w-xs ml-auto">
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
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
              <input
                type="number"
                min={0}
                value={paidAmount || ""}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Amount</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900">
                {formatCurrency(dueAmount)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    dueAmount <= 0
                      ? "bg-emerald-50 text-emerald-700"
                      : paidAmount > 0
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {dueAmount <= 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Unpaid"}
                </span>
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
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save & Complete"}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
