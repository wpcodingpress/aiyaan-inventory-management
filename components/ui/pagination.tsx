"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
  showingCount?: number;
  itemName?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, total, showingCount, itemName = "items" }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--outline-variant,#e0e0e0)] bg-[var(--surface-container,#f5f5f5)]">
      <span className="text-sm text-[var(--on-surface-variant,#666)]">
        Showing {showingCount ?? 0} of {total ?? 0} {itemName}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 text-sm border border-[var(--outline,#ccc)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-container-highest,#e8e8e8)] transition-colors"
        >
          Previous
        </button>
        <span className="text-sm text-[var(--on-surface-variant,#666)]">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 text-sm border border-[var(--outline,#ccc)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--surface-container-highest,#e8e8e8)] transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
