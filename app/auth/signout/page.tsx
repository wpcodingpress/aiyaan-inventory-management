"use client";

import { signOut } from "next-auth/react";

export default function SignOutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-error-container flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-on-error-container text-2xl">logout</span>
          </div>
          <h1 className="font-display-lg text-xl font-bold text-on-surface mb-2">
            Sign Out
          </h1>
          <p className="text-on-surface-variant text-sm font-body-md mb-8">
            Are you sure you want to sign out?
          </p>
          <div className="flex gap-3">
            <a
              href="/dashboard"
              className="flex-1 h-11 rounded-xl border border-outline-variant flex items-center justify-center text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-all font-body-md"
            >
              Cancel
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="flex-1 h-11 rounded-xl bg-error text-white flex items-center justify-center text-sm font-semibold hover:bg-error/90 transition-all font-body-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
