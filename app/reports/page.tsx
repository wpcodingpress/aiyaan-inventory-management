"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/app-layout";

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

const sampleData: Record<string, { columns: string[]; rows: (string | number)[][] }> = {
  "sales-summary": {
    columns: ["Date", "Invoice #", "Customer", "Items", "Total", "Status"],
    rows: [
      ["2026-08-01", "INV-1042", "Rahim Enterprises", "5", "৳12,500", "Paid"],
      ["2026-08-02", "INV-1043", "Karim Traders", "3", "৳7,800", "Paid"],
      ["2026-08-03", "INV-1044", "Fatima Boutique", "8", "৳21,200", "Pending"],
      ["2026-08-04", "INV-1045", "Sara Fashion House", "2", "৳4,500", "Paid"],
      ["2026-08-05", "INV-1046", "Downtown Retail", "12", "৳35,600", "Paid"],
    ],
  },
  "purchase-summary": {
    columns: ["Date", "PO #", "Supplier", "Items", "Total", "Status"],
    rows: [
      ["2026-08-01", "PO-2018", "Leather Masters BD", "50", "৳185,000", "Received"],
      ["2026-08-03", "PO-2019", "Footwear Components Ltd", "100", "৳320,000", "Shipped"],
      ["2026-08-05", "PO-2020", "Textile Source Inc", "200", "৳95,000", "Pending"],
      ["2026-08-07", "PO-2021", "Sole Makers Co", "75", "৳210,000", "Received"],
      ["2026-08-10", "PO-2022", "Artisan Supply House", "30", "৳78,000", "Received"],
    ],
  },
  "inventory-valuation": {
    columns: ["Category", "Units", "Avg Cost", "Cost Value", "Retail Value", "Margin"],
    rows: [
      ["Leather Sandals", "320", "৳450", "৳144,000", "৳240,000", "40%"],
      ["Canvas Sneakers", "180", "৳650", "৳117,000", "৳216,000", "45.8%"],
      ["Formal Shoes", "95", "৳1,200", "৳114,000", "৳209,000", "45.5%"],
      ["Sports Shoes", "140", "৳850", "৳119,000", "৳224,000", "46.9%"],
      ["Accessories", "450", "৳180", "৳81,000", "৳157,500", "48.6%"],
    ],
  },
  "profit-loss": {
    columns: ["Metric", "This Month", "Last Month", "Change"],
    rows: [
      ["Revenue", "৳585,600", "৳520,000", "+12.6%"],
      ["Cost of Goods Sold", "৳312,000", "৳280,000", "+11.4%"],
      ["Gross Profit", "৳273,600", "৳240,000", "+14.0%"],
      ["Operating Expenses", "৳85,000", "৳82,000", "+3.7%"],
      ["Net Profit", "৳188,600", "৳158,000", "+19.4%"],
      ["Profit Margin", "32.2%", "30.4%", "+1.8pp"],
    ],
  },
  "stock-movement": {
    columns: ["Movement Type", "Count", "Units", "Period"],
    rows: [
      ["Stock In (Purchase)", "42", "2,850", "This Month"],
      ["Stock In (Return)", "5", "85", "This Month"],
      ["Stock Out (Sale)", "68", "1,920", "This Month"],
      ["Stock Out (Damage)", "3", "12", "This Month"],
      ["Adjustment", "7", "+150", "This Month"],
    ],
  },
  "product-profitability": {
    columns: ["Product", "Units Sold", "Revenue", "Cost", "Profit", "Margin"],
    rows: [
      ["Classic Leather Sandal", "85", "৳76,500", "৳38,250", "৳38,250", "50.0%"],
      ["Urban Canvas Sneaker", "62", "৳74,400", "৳37,200", "৳37,200", "50.0%"],
      ["Executive Formal Shoe", "28", "৳67,200", "৳33,600", "৳33,600", "50.0%"],
      ["Sport Pro Runner", "45", "৳72,000", "৳38,250", "৳33,750", "46.9%"],
      ["Leather Belt Premium", "120", "৳48,000", "৳21,600", "৳26,400", "55.0%"],
    ],
  },
  "category-analysis": {
    columns: ["Category", "Products", "Total Stock", "Sales", "Revenue"],
    rows: [
      ["Sandals", "24", "320", "85", "৳76,500"],
      ["Sneakers", "18", "180", "62", "৳74,400"],
      ["Formal Shoes", "12", "95", "28", "৳67,200"],
      ["Sports Shoes", "15", "140", "45", "৳72,000"],
      ["Accessories", "35", "450", "120", "৳48,000"],
    ],
  },
  "expense-summary": {
    columns: ["Category", "This Month", "Last Month", "% of Total"],
    rows: [
      ["Rent & Utilities", "৳35,000", "৳35,000", "41.2%"],
      ["Staff Salaries", "৳28,000", "৳28,000", "32.9%"],
      ["Marketing", "৳8,500", "৳7,000", "10.0%"],
      ["Transportation", "৳6,200", "৳5,800", "7.3%"],
      ["Office Supplies", "৳3,800", "৳3,500", "4.5%"],
      ["Miscellaneous", "৳3,500", "৳2,700", "4.1%"],
    ],
  },
  "customer-balance": {
    columns: ["Customer", "Total Purchases", "Paid", "Balance", "Status"],
    rows: [
      ["Rahim Enterprises", "৳245,000", "৳220,000", "৳25,000", "Due"],
      ["Karim Traders", "৳180,000", "৳180,000", "৳0", "Clear"],
      ["Fatima Boutique", "৳320,000", "৳280,000", "৳40,000", "Overdue"],
      ["Sara Fashion House", "৳95,000", "৳95,000", "৳0", "Clear"],
      ["Downtown Retail", "৳510,000", "৳450,000", "৳60,000", "Due"],
    ],
  },
  "supplier-balance": {
    columns: ["Supplier", "Total Orders", "Paid", "Balance", "Status"],
    rows: [
      ["Leather Masters BD", "৳585,000", "৳550,000", "৳35,000", "Due"],
      ["Footwear Components Ltd", "৳820,000", "৳820,000", "৳0", "Clear"],
      ["Textile Source Inc", "৳295,000", "৳250,000", "৳45,000", "Due"],
      ["Sole Makers Co", "৳630,000", "৳600,000", "৳30,000", "Due"],
      ["Artisan Supply House", "৳210,000", "৳210,000", "৳0", "Clear"],
    ],
  },
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("This Month");
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const handleExportCSV = () => {
    if (!activeReport) return;
    const data = sampleData[activeReport];
    if (!data) return;
    const csv = [data.columns.join(","), ...data.rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeReport}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeData = activeReport ? sampleData[activeReport] : null;
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
              className="flex items-center gap-2 px-4 py-2 bg-primary-container text-white rounded-lg hover:opacity-90 text-sm font-medium"
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

        {activeReport && activeData && activeMeta && (
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant">
                    {activeData.columns.map((col) => (
                      <th key={col} className="text-left py-3 px-4 font-medium text-on-surface-variant">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeData.rows.map((row, i) => (
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
          </div>
        )}
      </div>
    </AppLayout>
  );
}
