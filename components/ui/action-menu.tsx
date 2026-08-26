"use client";

import { useState, useRef, useEffect } from "react";

export interface ActionMenuItem {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: "danger" | "default";
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

export default function ActionMenu({ items }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-[var(--surface-container,#f5f5f5)] transition-colors"
      >
        <span className="material-symbols-outlined text-[var(--on-surface-variant,#666)] text-lg">more_horiz</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-[var(--outline-variant,#e0e0e0)] shadow-lg z-50 py-1">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[var(--surface-container,#f5f5f5)] transition-colors text-left ${
                item.variant === "danger" ? "text-rose-600" : "text-[var(--on-surface,#1a1a1a)]"
              }`}
            >
              <span className={`material-symbols-outlined text-lg ${item.variant === "danger" ? "text-rose-500" : "text-[var(--on-surface-variant,#666)]"}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
