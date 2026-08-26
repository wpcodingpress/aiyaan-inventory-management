"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "Products", icon: "inventory_2", href: "/products" },
  { label: "Inventory", icon: "warehouse", href: "/inventory" },
  { label: "Purchases", icon: "shopping_cart", href: "/purchases" },
  { label: "Sales", icon: "sell", href: "/sales" },
  { label: "Customers", icon: "group", href: "/customers" },
  { label: "Suppliers", icon: "factory", href: "/suppliers" },
  { label: "Finance", icon: "payments", href: "/finance" },
  { label: "Expenses", icon: "receipt_long", href: "/expenses" },
  { label: "Reports", icon: "analytics", href: "/reports" },
  { label: "Settings", icon: "settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [org, setOrg] = useState<{ logo?: string; businessName?: string; businessType?: string }>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const o = data.organization;
        if (o) {
          setOrg({
            logo: o.logo || "",
            businessName: o.name || "",
            businessType: o.businessType || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-inverse-surface flex flex-col z-50">
      {/* Logo Area */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          {org.logo ? (
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
              <img src={org.logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">package_2</span>
            </div>
          )}
          <div>
            <h1 className="text-white font-display-lg text-sm font-bold tracking-wide">
              {(org.businessName || "INVENTORY PLATFORM").toUpperCase()}
            </h1>
            <p className="text-white/50 text-xs font-body-sm">
              {org.businessType || "Inventory Platform"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-white/10 text-white border-l-[3px] border-white/40 font-semibold"
                      : "text-white/50 hover:bg-white/5 hover:text-white border-l-[3px] border-transparent"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="font-body-md">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center">
            <span className="text-white text-sm font-semibold font-body-md">AU</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium font-body-md truncate">Admin User</p>
            <p className="text-white/40 text-xs font-body-sm truncate">admin@aiyaanscrafts.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
