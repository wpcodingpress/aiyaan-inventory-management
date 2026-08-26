"use client";

import { useState, useEffect } from "react";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const [org, setOrg] = useState<{ logo?: string; businessName?: string }>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const o = data.organization;
        if (o) {
          setOrg({
            logo: o.logo || "",
            businessName: o.name || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-surface border-b border-outline-variant z-40 flex items-center px-6 gap-4">
      {/* Page Title */}
      <div className="flex items-center gap-3 shrink-0">
        {org.logo ? (
          <div className="w-7 h-7 rounded-lg bg-white border border-outline-variant flex items-center justify-center overflow-hidden">
            <img src={org.logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <span className="material-symbols-outlined text-[22px] text-on-surface-variant">package_2</span>
        )}
        <h2 className="font-display-md text-lg font-semibold text-on-surface shrink-0">
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
            placeholder="Search SKU, Invoice..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low border border-outline-variant text-sm font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>
    </header>
  );
}
