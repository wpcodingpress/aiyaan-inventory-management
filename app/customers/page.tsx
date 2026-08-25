"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

const sampleCustomers = [
  { id: "1", name: "Bata Retailers Ltd.", email: "sales@bata.com", phone: "+8802-5551234", type: "Wholesale", totalSpent: 735000, outstanding: 0, totalSales: 8, status: "Active" },
  { id: "2", name: "Apex Footwear", email: "contact@apex.com", phone: "+8802-5555678", type: "Distributor", totalSpent: 520000, outstanding: 110000, totalSales: 5, status: "Active" },
  { id: "3", name: "Lotto Outlets", email: "info@lotto.com", phone: "+8802-5558765", type: "Retail Chain", totalSpent: 285500, outstanding: 85500, totalSales: 3, status: "Active" },
];

const typeColors: Record<string, string> = {
  Wholesale: "bg-blue-50 text-blue-700 border border-blue-200",
  Distributor: "bg-purple-50 text-purple-700 border border-purple-200",
  "Retail Chain": "bg-teal-50 text-teal-700 border border-teal-200",
  Retail: "bg-amber-50 text-amber-700 border border-amber-200",
  Individual: "bg-gray-50 text-gray-700 border border-gray-200",
};

const statusColors: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Inactive: "bg-gray-50 text-gray-700 border border-gray-200",
};

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = sampleCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <AppLayout title="Customers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Manage your customer accounts and outstanding balances.</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-colors text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Add Customer
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="relative max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input
                type="text"
                placeholder="Search customers by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#4f46e5] focus:border-[#4f46e5] outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#4f46e5]/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-[#4f46e5]">
                            {customer.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[customer.type] || typeColors.Individual}`}>
                        {customer.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">৳{customer.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">
                      <span className={customer.outstanding > 0 ? "text-rose-600" : "text-gray-600"}>
                        ৳{customer.outstanding.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{customer.totalSales}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[customer.status]}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {filtered.length} of {sampleCustomers.length} customers
            </p>
            <div className="flex gap-1">
              <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed" disabled>Previous</button>
              <button className="px-3 py-1 text-sm bg-[#4f46e5] text-white rounded">1</button>
              <button className="px-3 py-1 text-sm text-gray-400 cursor-not-allowed" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
