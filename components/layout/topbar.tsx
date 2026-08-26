"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

interface TopBarProps {
  title: string;
  onMenuToggle: () => void;
}

interface LowStockAlert {
  id: string;
  name: string;
  variant: string;
  currentStock: number;
  minimumStock: number;
}

export default function TopBar({ title, onMenuToggle }: TopBarProps) {
  const { primaryColor } = useTheme();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [notifications, setNotifications] = useState<LowStockAlert[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [org, setOrg] = useState<{ logo?: string; businessName?: string }>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const o = data.organization;
        if (o) {
          setOrg({ logo: o.logo || "", businessName: o.name || "" });
        }
      })
      .catch(() => {});

    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.lowStockAlerts) setNotifications(data.lowStockAlerts);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 md:left-[260px] right-0 h-16 bg-surface border-b border-outline-variant z-40 flex items-center px-4 md:px-6 gap-3 md:gap-4 transition-all duration-300">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant"
      >
        <span className="material-symbols-outlined text-[22px]">menu</span>
      </button>

      {/* Page Title */}
      <div className="flex items-center gap-3 shrink-0">
        {org.logo ? (
          <div className="w-7 h-7 rounded-lg bg-white border border-outline-variant flex items-center justify-center overflow-hidden">
            <img src={org.logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ color: primaryColor }}
          >
            package_2
          </span>
        )}
        <h2 className="font-display-md text-lg font-semibold text-on-surface shrink-0 hidden sm:block">
          {org.businessName || title}
        </h2>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search SKU, Invoice..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low border border-outline-variant text-sm font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 transition-all"
            style={{ "--tw-ring-color": `${primaryColor}30`, borderColor: "var(--tw-ring-color)" } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface relative"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {notifications.length > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-outline-variant z-50 overflow-hidden animate-slide-in-up">
                <div className="px-4 py-3 border-b border-outline-variant">
                  <h3 className="font-semibold text-sm text-on-surface">Low Stock Alerts</h3>
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-on-surface-variant text-sm">
                      No low stock alerts
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors"
                      >
                        <p className="text-sm font-medium text-on-surface">{n.name}</p>
                        <p className="text-xs text-on-surface-variant">{n.variant}</p>
                        <p className="text-xs mt-1">
                          <span className="font-semibold" style={{ color: "#ef4444" }}>
                            {n.currentStock}
                          </span>
                          <span className="text-on-surface-variant"> / {n.minimumStock} min</span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => router.push("/settings")}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        {/* User avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold cursor-pointer hover:opacity-90 transition-opacity ml-1"
          style={{ backgroundColor: primaryColor }}
        >
          AU
        </div>
      </div>
    </header>
  );
}
