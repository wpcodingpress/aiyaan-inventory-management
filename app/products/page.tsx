"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/app-layout";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [stockStatus, setStockStatus] = useState("");

  const sampleProducts = [
    { id: "1", name: "Premium Leather Loafer", sku: "AY-LFR-001", category: "Formal", variantCount: "4 sizes, 2 colors", cost: 2200, price: 3800, stock: 85, status: "In Stock", statusColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { id: "2", name: "Classic Oxford Lace-up", sku: "AY-OXF-042", category: "Formal", variantCount: "5 sizes, 1 color", cost: 2500, price: 4200, stock: 12, status: "Low Stock", statusColor: "bg-amber-50 text-amber-700 border-amber-200" },
    { id: "3", name: "Everyday Suede Chukka", sku: "AY-CHK-019", category: "Casual", variantCount: "3 sizes, 3 colors", cost: 1800, price: 3100, stock: 0, status: "Out of Stock", statusColor: "bg-rose-50 text-rose-700 border-rose-200" },
  ];

  const fetchProducts = async () => {
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
  };

  useEffect(() => {
    fetchProducts();
  }, [page, category, brand, stockStatus]);

  const displayProducts = products.length > 0 ? products : sampleProducts;

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
              {(loading ? [] : displayProducts).map((product: any) => (
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
                  <td className="px-4 py-3 text-sm text-[var(--on-surface-variant,#666)]">{typeof product.variantCount === "number" ? `${product.variantCount} variants` : product.variantCount}</td>
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
                      <button className="p-1.5 rounded-lg hover:bg-[var(--surface-container,#f5f5f5)] transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[var(--on-surface-variant,#666)] text-lg">edit</span>
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-[var(--surface-container,#f5f5f5)] transition-colors" title="View">
                        <span className="material-symbols-outlined text-[var(--on-surface-variant,#666)] text-lg">visibility</span>
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-[var(--surface-container,#f5f5f5)] transition-colors" title="Adjust Stock">
                        <span className="material-symbols-outlined text-[var(--on-surface-variant,#666)] text-lg">tune</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && displayProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[var(--on-surface-variant,#999)]">
                    <span className="material-symbols-outlined text-4xl mb-2 block">inventory_2</span>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--outline-variant,#e0e0e0)] bg-[var(--surface-container,#f5f5f5)]">
            <span className="text-sm text-[var(--on-surface-variant,#666)]">
              Showing {displayProducts.length} of {total || displayProducts.length} products
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-[var(--outline,#ccc)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-container-highest,#e8e8e8)] transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-[var(--on-surface-variant,#666)]">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-[var(--outline,#ccc)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-container-highest,#e8e8e8)] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
