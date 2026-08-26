"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/app-layout";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import Modal from "@/components/ui/modal";
import Pagination from "@/components/ui/pagination";

interface ProductVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  material: string | null;
  purchaseCost: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  variantCount: number;
  cost: number;
  price: number;
  stock: number;
  status: string;
  thumbnail: string | null;
}

interface ProductDetail {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  image: string | null;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string } | null;
  variants: ProductVariant[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  const [viewProduct, setViewProduct] = useState<ProductDetail | null>(null);
  const [editProduct, setEditProduct] = useState<ProductDetail | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<ProductDetail | null>(null);
  const [adjustVariant, setAdjustVariant] = useState<string>("");
  const [adjustQty, setAdjustQty] = useState<string>("");
  const [adjustType, setAdjustType] = useState<"increase" | "decrease">("increase");
  const [saving, setSaving] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (brand) params.set("brand", brand);
      if (stockStatus) params.set("stockStatus", stockStatus);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, brand, stockStatus]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchProductDetail = async (id: string): Promise<ProductDetail | null> => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const handleView = async (productId: string) => {
    const detail = await fetchProductDetail(productId);
    if (detail) setViewProduct(detail);
  };

  const handleEdit = async (productId: string) => {
    const detail = await fetchProductDetail(productId);
    if (detail) setEditProduct(detail);
  };

  const handleEditSave = async () => {
    if (!editProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editProduct.name,
          sku: editProduct.sku,
          description: editProduct.description,
        }),
      });
      if (res.ok) {
        setEditProduct(null);
        fetchProducts();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustStock = async (productId: string) => {
    const detail = await fetchProductDetail(productId);
    if (detail) {
      setAdjustProduct(detail);
      if (detail.variants.length > 0) {
        setAdjustVariant(detail.variants[0].id);
      }
      setAdjustQty("");
      setAdjustType("increase");
    }
  };

  const handleAdjustSave = async () => {
    if (!adjustProduct || !adjustVariant || !adjustQty) return;
    setSaving(true);
    try {
      const selectedVariant = adjustProduct.variants.find((v) => v.id === adjustVariant);
      if (!selectedVariant) return;

      const qty = parseInt(adjustQty);
      if (isNaN(qty) || qty <= 0) return;

      const newStock =
        adjustType === "increase"
          ? selectedVariant.currentStock + qty
          : Math.max(0, selectedVariant.currentStock - qty);

      await fetch(`/api/products/${adjustProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: adjustProduct.name, sku: adjustProduct.sku }),
      });

      setAdjustProduct(null);
      fetchProducts();
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to archive this product?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    } catch {}
  };

  return (
    <AppLayout title="Product Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-variant,#666)] text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
                className="pl-10 pr-4 py-2 border border-[var(--outline,#ccc)] rounded-lg bg-white text-[var(--on-surface,#1a1a1a)] focus:outline-none focus:ring-2 focus:ring-[var(--primary,#6750a4)] w-64"
              />
            </div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-[var(--outline,#ccc)] rounded-lg bg-white text-[var(--on-surface,#1a1a1a)] focus:outline-none focus:ring-2 focus:ring-[var(--primary,#6750a4)]"
            >
              <option value="">All Categories</option>
              <option value="Formal">Formal</option>
              <option value="Casual">Casual</option>
              <option value="Athletic">Athletic</option>
              <option value="Sandals">Sandals</option>
            </select>
            <select
              value={brand}
              onChange={(e) => { setBrand(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-[var(--outline,#ccc)] rounded-lg bg-white text-[var(--on-surface,#1a1a1a)] focus:outline-none focus:ring-2 focus:ring-[var(--primary,#6750a4)]"
            >
              <option value="">All Brands</option>
              <option value="Aiyaan">Aiyaan</option>
              <option value="Urban Step">Urban Step</option>
            </select>
            <select
              value={stockStatus}
              onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-[var(--outline,#ccc)] rounded-lg bg-white text-[var(--on-surface,#1a1a1a)] focus:outline-none focus:ring-2 focus:ring-[var(--primary,#6750a4)]"
            >
              <option value="">All Stock Status</option>
              <option value="inStock">In Stock</option>
              <option value="lowStock">Low Stock</option>
              <option value="outOfStock">Out of Stock</option>
            </select>
          </div>
          <Link href="/products/new" className="flex items-center gap-2 px-4 py-2 bg-[var(--primary,#6750a4)] text-white rounded-lg hover:bg-[var(--primary,#6750a4)]/90 transition-colors font-medium">
            <span className="material-symbols-outlined text-lg">add</span>
            Add Product
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-[var(--outline-variant,#e0e0e0)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--outline-variant,#e0e0e0)] bg-[var(--surface-container,#f5f5f5)]">
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--on-surface-variant,#666)]">Product</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--on-surface-variant,#666)]">SKU</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--on-surface-variant,#666)]">Category</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--on-surface-variant,#666)]">Variants</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--on-surface-variant,#666)]">Cost</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--on-surface-variant,#666)]">Price</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-[var(--on-surface-variant,#666)]">Stock</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-[var(--on-surface-variant,#666)]">Status</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-[var(--on-surface-variant,#666)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? [] : products).map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[var(--outline-variant,#e0e0e0)] last:border-b-0 hover:bg-[var(--surface-container-low,#fafafa)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[var(--surface-container,#f5f5f5)] flex items-center justify-center overflow-hidden">
                        {product.thumbnail ? (
                          <img src={product.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[var(--on-surface-variant,#999)]">inventory_2</span>
                        )}
                      </div>
                      <span className="font-medium text-[var(--on-surface,#1a1a1a)]">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--on-surface-variant,#666)] font-mono">{product.sku}</td>
                  <td className="px-4 py-3 text-sm text-[var(--on-surface-variant,#666)]">{product.category}</td>
                  <td className="px-4 py-3 text-sm text-[var(--on-surface-variant,#666)]">{product.variantCount} variants</td>
                  <td className="px-4 py-3 text-sm text-[var(--on-surface-variant,#666)] text-right">{formatCurrency(Number(product.cost))}</td>
                  <td className="px-4 py-3 text-sm text-[var(--on-surface,#1a1a1a)] font-medium text-right">{formatCurrency(Number(product.price))}</td>
                  <td className="px-4 py-3 text-sm text-[var(--on-surface,#1a1a1a)] font-medium text-right">{product.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(product.id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--surface-container,#f5f5f5)] transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[var(--on-surface-variant,#666)] text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => handleView(product.id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--surface-container,#f5f5f5)] transition-colors"
                        title="View"
                      >
                        <span className="material-symbols-outlined text-[var(--on-surface-variant,#666)] text-lg">visibility</span>
                      </button>
                      <button
                        onClick={() => handleAdjustStock(product.id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--surface-container,#f5f5f5)] transition-colors"
                        title="Adjust Stock"
                      >
                        <span className="material-symbols-outlined text-[var(--on-surface-variant,#666)] text-lg">tune</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[var(--on-surface-variant,#999)]">
                    <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={total}
            showingCount={products.length}
            itemName="products"
          />
        </div>
      </div>

      <Modal isOpen={!!viewProduct} onClose={() => setViewProduct(null)} title="Product Details" size="lg">
        {viewProduct && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-[var(--surface-container,#f5f5f5)] flex items-center justify-center overflow-hidden">
                {viewProduct.image ? (
                  <img src={viewProduct.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-3xl text-[var(--on-surface-variant,#999)]">inventory_2</span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--on-surface,#1a1a1a)]">{viewProduct.name}</h3>
                <p className="text-sm text-[var(--on-surface-variant,#666)]">SKU: {viewProduct.sku}</p>
                {viewProduct.description && (
                  <p className="text-sm text-[var(--on-surface-variant,#666)] mt-1">{viewProduct.description}</p>
                )}
                <div className="flex gap-3 mt-2">
                  {viewProduct.category && (
                    <span className="text-xs px-2 py-1 bg-[var(--surface-container,#f5f5f5)] rounded-full text-[var(--on-surface-variant,#666)]">
                      {viewProduct.category.name}
                    </span>
                  )}
                  {viewProduct.brand && (
                    <span className="text-xs px-2 py-1 bg-[var(--surface-container,#f5f5f5)] rounded-full text-[var(--on-surface-variant,#666)]">
                      {viewProduct.brand.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[var(--on-surface-variant,#666)] mb-3">Variants ({viewProduct.variants.length})</h4>
              {viewProduct.variants.length === 0 ? (
                <p className="text-sm text-[var(--on-surface-variant,#999)]">No variants</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--outline-variant,#e0e0e0)]">
                        <th className="text-left py-2 text-[var(--on-surface-variant,#666)] font-medium">SKU</th>
                        <th className="text-left py-2 text-[var(--on-surface-variant,#666)] font-medium">Size</th>
                        <th className="text-left py-2 text-[var(--on-surface-variant,#666)] font-medium">Color</th>
                        <th className="text-right py-2 text-[var(--on-surface-variant,#666)] font-medium">Cost</th>
                        <th className="text-right py-2 text-[var(--on-surface-variant,#666)] font-medium">Price</th>
                        <th className="text-right py-2 text-[var(--on-surface-variant,#666)] font-medium">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewProduct.variants.map((v) => (
                        <tr key={v.id} className="border-b border-[var(--outline-variant,#e0e0e0)] last:border-b-0">
                          <td className="py-2 font-mono text-[var(--on-surface,#1a1a1a)]">{v.sku}</td>
                          <td className="py-2 text-[var(--on-surface-variant,#666)]">{v.size || "-"}</td>
                          <td className="py-2 text-[var(--on-surface-variant,#666)]">{v.color || "-"}</td>
                          <td className="py-2 text-right text-[var(--on-surface-variant,#666)]">{formatCurrency(Number(v.purchaseCost))}</td>
                          <td className="py-2 text-right text-[var(--on-surface,#1a1a1a)] font-medium">{formatCurrency(Number(v.sellingPrice))}</td>
                          <td className="py-2 text-right">
                            <span className={`font-medium ${v.currentStock === 0 ? "text-rose-600" : v.currentStock <= (v.minimumStock || 0) ? "text-amber-600" : "text-[var(--on-surface,#1a1a1a)]"}`}>
                              {v.currentStock}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewProduct(null)}
                className="px-4 py-2 border border-[var(--outline,#ccc)] rounded-lg text-[var(--on-surface,#1a1a1a)] hover:bg-[var(--surface-container,#f5f5f5)] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product">
        {editProduct && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant,#666)] mb-1">Product Name</label>
              <input
                type="text"
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--outline,#ccc)] rounded-lg bg-white text-[var(--on-surface,#1a1a1a)] focus:outline-none focus:ring-2 focus:ring-[var(--primary,#6750a4)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant,#666)] mb-1">SKU</label>
              <input
                type="text"
                value={editProduct.sku}
                onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--outline,#ccc)] rounded-lg bg-white text-[var(--on-surface,#1a1a1a)] focus:outline-none focus:ring-2 focus:ring-[var(--primary,#6750a4)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant,#666)] mb-1">Description</label>
              <textarea
                value={editProduct.description || ""}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-[var(--outline,#ccc)] rounded-lg bg-white text-[var(--on-surface,#1a1a1a)] focus:outline-none focus:ring-2 focus:ring-[var(--primary,#6750a4)]"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setEditProduct(null)}
                className="px-4 py-2 border border-[var(--outline,#ccc)] rounded-lg text-[var(--on-surface,#1a1a1a)] hover:bg-[var(--surface-container,#f5f5f5)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={saving}
                className="px-4 py-2 bg-[var(--primary,#6750a4)] text-white rounded-lg hover:bg-[var(--primary,#6750a4)]/90 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!adjustProduct} onClose={() => setAdjustProduct(null)} title="Adjust Stock">
        {adjustProduct && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--on-surface-variant,#666)]">
              Adjust stock for <strong className="text-[var(--on-surface,#1a1a1a)]">{adjustProduct.name}</strong>
            </p>

            {adjustProduct.variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-[var(--on-surface-variant,#666)] mb-1">Select Variant</label>
                <select
                  value={adjustVariant}
                  onChange={(e) => setAdjustVariant(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--outline,#ccc)] rounded-lg bg-white text-[var(--on-surface,#1a1a1a)] focus:outline-none focus:ring-2 focus:ring-[var(--primary,#6750a4)]"
                >
                  {adjustProduct.variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.sku} {v.size ? `- ${v.size}` : ""} {v.color ? `/ ${v.color}` : ""} (Stock: {v.currentStock})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant,#666)] mb-1">Adjustment Type</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setAdjustType("increase")}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    adjustType === "increase"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "border-[var(--outline,#ccc)] text-[var(--on-surface-variant,#666)] hover:bg-[var(--surface-container,#f5f5f5)]"
                  }`}
                >
                  + Increase
                </button>
                <button
                  onClick={() => setAdjustType("decrease")}
                  className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-colors ${
                    adjustType === "decrease"
                      ? "bg-rose-50 border-rose-300 text-rose-700"
                      : "border-[var(--outline,#ccc)] text-[var(--on-surface-variant,#666)] hover:bg-[var(--surface-container,#f5f5f5)]"
                  }`}
                >
                  - Decrease
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--on-surface-variant,#666)] mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="Enter quantity"
                className="w-full px-3 py-2 border border-[var(--outline,#ccc)] rounded-lg bg-white text-[var(--on-surface,#1a1a1a)] focus:outline-none focus:ring-2 focus:ring-[var(--primary,#6750a4)]"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setAdjustProduct(null)}
                className="px-4 py-2 border border-[var(--outline,#ccc)] rounded-lg text-[var(--on-surface,#1a1a1a)] hover:bg-[var(--surface-container,#f5f5f5)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustSave}
                disabled={saving || !adjustQty || parseInt(adjustQty) <= 0}
                className="px-4 py-2 bg-[var(--primary,#6750a4)] text-white rounded-lg hover:bg-[var(--primary,#6750a4)]/90 transition-colors font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Apply Adjustment"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
