"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

const sampleSuppliers = [
  { id: "1", name: "Premium Leather Goods Co.", contact: "Mr. Rahman", email: "contact@premiumleather.com", phone: "+8802-987654321", totalPurchases: 12, totalSpent: 450000, outstanding: 0, rating: 4.8, status: "Active" },
  { id: "2", name: "Footwear Manufacturers Ltd.", contact: "Ms. Islam", email: "sales@footwearmfrs.com", phone: "+8802-876543210", totalPurchases: 8, totalSpent: 320000, outstanding: 48000, rating: 4.5, status: "Active" },
  { id: "3", name: "BD Leather Exports", contact: "Mr. Khan", email: "export@bdleather.com", phone: "+8802-765432109", totalPurchases: 5, totalSpent: 180000, outstanding: 25000, rating: 4.2, status: "Active" },
];

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = sampleSuppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.contact.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`material-symbols-outlined text-[16px] ${
              i < full ? "text-amber-400" : i === full && half ? "text-amber-400" : "text-gray-200"
            }`}
            style={i === full && half ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            {i < full || (i === full && half) ? "star" : "star"}
          </span>
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}</span>
      </div>
    );
  };

  return (
    <AppLayout title="Suppliers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Manage your supplier relationships and purchase history.</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Supplier
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Person</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchases</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding Balance</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-gray-400">
                      No suppliers found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.contact}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{supplier.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium">{supplier.totalPurchases}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">৳{supplier.totalSpent.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right font-medium">
                        <span className={supplier.outstanding > 0 ? "text-rose-600" : "text-gray-900"}>
                          ৳{supplier.outstanding.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">{renderStars(supplier.rating)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {supplier.status}
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
              Showing {paginated.length} of {filtered.length} suppliers
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === page ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded disabled:text-gray-300 disabled:cursor-not-allowed"
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
