"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-4xl" : "max-w-2xl";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={`bg-white rounded-2xl shadow-xl w-full ${sizeClass} mx-4 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--outline-variant,#e0e0e0)]">
          <h2 className="text-lg font-semibold text-[var(--on-surface,#1a1a1a)]">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--surface-container,#f5f5f5)] transition-colors">
            <span className="material-symbols-outlined text-[var(--on-surface-variant,#666)]">close</span>
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
