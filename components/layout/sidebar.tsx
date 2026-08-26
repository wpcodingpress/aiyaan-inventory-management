"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";

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

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { primaryColor } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [org, setOrg] = useState<{ logo?: string; businessName?: string; businessType?: string }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);

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

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const sidebarWidth = collapsed ? "w-16" : "w-[260px]";

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 bottom-0 ${sidebarWidth} z-50
          bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]
          flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${mounted ? "" : "opacity-0 md:opacity-100"}
        `}
      >
        {/* Logo Area */}
        <div className={`border-b border-white/10 ${collapsed ? "px-3 py-5" : "px-6 py-6"}`}>
          <div className="flex items-center gap-3">
            {org.logo ? (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <img src={org.logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="material-symbols-outlined text-white text-xl">package_2</span>
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-white font-display-lg text-sm font-bold tracking-wide truncate">
                  {(org.businessName || "INVENTORY PLATFORM").toUpperCase()}
                </h1>
                <p className="text-white/50 text-xs font-body-sm truncate">
                  {org.businessType || "Inventory Platform"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item, i) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li
                  key={item.href}
                  className={mounted ? "animate-slide-in-left" : ""}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`
                      group relative flex items-center gap-3 rounded-lg text-sm font-medium
                      transition-all duration-200 ease-in-out
                      ${collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"}
                      ${isActive
                        ? "text-white"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                      }
                    `}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20)`,
                            borderLeft: `3px solid ${primaryColor}`,
                            boxShadow: `0 0 20px ${primaryColor}15`,
                          }
                        : { borderLeft: "3px solid transparent" }
                    }
                  >
                    <span className="material-symbols-outlined text-[20px] shrink-0">
                      {item.icon}
                    </span>
                    {!collapsed && <span className="font-body-md truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <div className="px-2 pb-2">
          <button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200 text-xs"
          >
            <span
              className="material-symbols-outlined text-[18px] transition-transform duration-300"
              style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              keyboard_double_arrow_left
            </span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User Profile */}
        <div className={`border-t border-white/10 ${collapsed ? "px-2 py-4" : "px-4 py-4"}`}>
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-semibold"
              style={{ backgroundColor: primaryColor }}
            >
              AU
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium font-body-md truncate">Admin User</p>
                <p className="text-white/40 text-xs font-body-sm truncate">admin@aiyaanscrafts.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
