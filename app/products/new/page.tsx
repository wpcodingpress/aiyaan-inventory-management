"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    brand: "",
    costPrice: "",
    sellingPrice: "",
    minimumStock: "",
  });

  useEffect(() => {
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((data) => {
        const cats = [...new Set((data.products || []).map((p: any) => p.category).filter(Boolean))] as string[];
        const bnds = [...new Set((data.products || []).map((p: any) => p.brand).filter(Boolean))] as string[];
        setCategories(cats);
        setBrands(bnds);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          description: form.description,
          categoryId: null,
          brandId: null,
          variants: [{
            sku: form.sku || `VAR-${Date.now()}`,
            purchaseCost: parseFloat(form.costPrice) || 0,
            sellingPrice: parseFloat(form.sellingPrice) || 0,
            currentStock: 0,
            minimumStock: parseInt(form.minimumStock) || 0,
          }],
        }),
      });
      if (res.ok) {
        router.push("/products");
      }
    } catch (err) {
      console.error("Failed to create product:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Create Product">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-outline-variant/40 p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Premium Leather Loafer" className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">SKU</label>
              <input name="sku" value={form.sku} onChange={handleChange} placeholder="Auto-generated if empty" className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none font-mono" />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Product description..." className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none resize-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Category</label>
              <input name="category" value={form.category} onChange={handleChange} list="category-list" placeholder="e.g. Formal" className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none" />
              <datalist id="category-list">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Brand</label>
              <input name="brand" value={form.brand} onChange={handleChange} list="brand-list" placeholder="e.g. Aiyaan" className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none" />
              <datalist id="brand-list">
                {brands.map((b) => <option key={b} value={b} />)}
              </datalist>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Cost Price (৳)</label>
              <input name="costPrice" type="number" step="0.01" min="0" value={form.costPrice} onChange={handleChange} placeholder="0.00" className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Selling Price (৳)</label>
              <input name="sellingPrice" type="number" step="0.01" min="0" value={form.sellingPrice} onChange={handleChange} placeholder="0.00" className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Minimum Stock</label>
              <input name="minimumStock" type="number" min="0" value={form.minimumStock} onChange={handleChange} placeholder="0" className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container outline-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Link href="/products" className="px-5 py-2.5 border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary-container text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
