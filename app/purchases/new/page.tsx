"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

interface LineItem {
  id: number;
  productId: string;
  quantity: number;
  unitCost: number;
  discount: number;
  tax: number;
  total: number;
}

const productOptions = [
  { id: "p1", name: "Classic Oxford Brogue - Tan / 42" },
  { id: "p2", name: "Suede Chelsea Boot - Navy / 44" },
  { id: "p3", name: "Leather Loafer - Black / 41" },
  { id: "p4", name: "Handstitched Monk Strap - Oxblood / 43" },
  { id: "p5", name: "Minimalist Sneaker - White / 42" },
];

export default function CreatePurchasePage() {
  const [supplier, setSupplier] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, productId: "", quantity: 1, unitCost: 0, discount: 0, tax: 0, total: 0 },
  ]);
  const [paidAmount, setPaidAmount] = useState(0);

  const updateLineItem = (id: number, field: keyof LineItem, value: number | string) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.total = updated.quantity * updated.unitCost - updated.discount + updated.tax;
        return updated;
      })
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: Date.now(), productId: "", quantity: 1, unitCost: 0, discount: 0, tax: 0, total: 0 },
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
                <option value="s1">Premium Leather Goods Co.</option>
                <option value="s2">BD Leather Exports</option>
                <option value="s3">Footwear Manufacturers Ltd.</option>
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
                        value={item.productId}
                        onChange={(e) => updateLineItem(item.id, "productId", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Select product...</option>
                        {productOptions.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
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
                      ৳{item.total.toLocaleString()}
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
                ৳{dueAmount.toLocaleString()}
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
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            Save as Draft
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Save & Complete
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
