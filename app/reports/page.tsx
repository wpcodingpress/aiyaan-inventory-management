"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/app-layout";
import { formatCurrency } from "@/lib/utils";

const reports = [
  { id: "sales-summary", title: "Sales Summary", icon: "sell", color: "bg-primary-container", textColor: "text-primary-container", description: "Overview of sales performance, revenue, and top-selling products." },
  { id: "purchase-summary", title: "Purchase Summary", icon: "shopping_cart", color: "bg-emerald-100", textColor: "text-emerald-600", description: "Summary of all purchases, suppliers, and procurement costs." },
  { id: "inventory-valuation", title: "Inventory Valuation", icon: "warehouse", color: "bg-amber-100", textColor: "text-amber-600", description: "Current inventory value at cost and retail prices." },
  { id: "profit-loss", title: "Profit & Loss", icon: "payments", color: "bg-purple-100", textColor: "text-purple-600", description: "Revenue, expenses, gross profit, and net profit breakdown." },
  { id: "stock-movement", title: "Stock Movement", icon: "swap_vert", color: "bg-blue-100", textColor: "text-blue-600", description: "Track stock ins, outs, transfers, and adjustments." },
  { id: "product-profitability", title: "Product Profitability", icon: "trending_up", color: "bg-emerald-100", textColor: "text-emerald-600", description: "Profit margins and profitability for each product." },
  { id: "category-analysis", title: "Category Analysis", icon: "category", color: "bg-orange-100", textColor: "text-orange-600", description: "Sales and inventory breakdown by product category." },
  { id: "expense-summary", title: "Expense Summary", icon: "receipt_long", color: "bg-rose-100", textColor: "text-rose-600", description: "Detailed breakdown of all business expenses." },
  { id: "customer-balance", title: "Customer Balance", icon: "group", color: "bg-teal-100", textColor: "text-teal-600", description: "Outstanding balances owed by customers." },
  { id: "supplier-balance", title: "Supplier Balance", icon: "factory", color: "bg-indigo-100", textColor: "text-indigo-600", description: "Outstanding payments due to suppliers." },
];

const dateRanges = ["This Month", "Last Month", "This Quarter", "This Year", "Custom"];

function dateRangeToParam(range: string) {
  switch (range) {
    case "This Month": return "thisMonth";
    case "Last Month": return "lastMonth";
    case "This Quarter": return "thisQuarter";
    case "This Year": return "thisYear";
    default: return "thisMonth";
  }
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("This Month");
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<{ columns: string[]; rows: (string | number)[][] } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async (reportId: string) => {
    setLoading(true);
    setReportData(null);
    try {
      const params = new URLSearchParams({ report: reportId, period: dateRangeToParam(dateRange) });
      const res = await fetch(`/api/reports?${params}`);
      const data = await res.json();
      setReportData(data);
    } catch {
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (activeReport) fetchReport(activeReport);
  }, [activeReport, fetchReport]);

  const handleExportCSV = () => {
    if (!reportData || !activeReport) return;
    const csv = [reportData.columns.join(","), ...reportData.rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeReport}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeMeta = activeReport ? reports.find((r) => r.id === activeReport) : null;

  return (
    <AppLayout title="Reports">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {dateRanges.map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? "bg-primary-container text-white"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          {activeReport && (
            <button
              onClick={handleExportCSV}
              disabled={!reportData}
              className="flex items-center gap-2 px-4 py-2 bg-primary-container text-white rounded-lg hover:opacity-90 text-sm font-medium disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export CSV
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReport(activeReport === report.id ? null : report.id)}
              className={`text-left p-5 rounded-xl border transition-all hover:shadow-md ${
                activeReport === report.id
                  ? "border-primary-container shadow-md bg-surface-container"
                  : "border-outline-variant bg-surface-container-low hover:bg-surface-container"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.color}`}>
                  <span className={`material-symbols-outlined text-[24px] ${report.textColor}`}>{report.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-on-surface">{report.title}</h3>
                  <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{report.description}</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary-container">
                    {activeReport === report.id ? "Hide Report" : "View Report"}
                    <span className="material-symbols-outlined text-[14px]">
                      {activeReport === report.id ? "expand_less" : "arrow_forward"}
                    </span>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {activeReport && activeMeta && (
          <div className="bg-surface-container rounded-xl border border-outline-variant p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeMeta.color}`}>
                <span className={`material-symbols-outlined text-[20px] ${activeMeta.textColor}`}>{activeMeta.icon}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-on-surface">{activeMeta.title}</h2>
                <p className="text-sm text-on-surface-variant">{dateRange}</p>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                  Loading report data...
                </div>
              </div>
            ) : reportData ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      {reportData.columns.map((col) => (
                        <th key={col} className="text-left py-3 px-4 font-medium text-on-surface-variant">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.rows.map((row, i) => (
                      <tr key={i} className="border-b border-outline-variant/50 hover:bg-surface-container-low">
                        {row.map((cell, j) => (
                          <td key={j} className="py-3 px-4 text-on-surface">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No data available.</p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
