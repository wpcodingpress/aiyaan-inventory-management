"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-white text-2xl">package_2</span>
            </div>
            <h1 className="font-display-lg text-xl font-bold text-on-surface tracking-wide">
              INVENTORY PLATFORM
            </h1>
            <p className="text-on-surface-variant text-sm font-body-md mt-1">
              Sign in to your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-error-container text-on-error-container text-sm font-body-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-on-surface mb-1.5 font-body-md"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@aiyaanscrafts.com"
                className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-sm font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-on-surface mb-1.5 font-body-md"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-sm font-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container transition-all"
              />
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-primary-container/30"
                />
                <span className="text-sm text-on-surface-variant font-body-md">Remember me</span>
              </label>
              <a
                href="#"
                className="text-sm text-primary-container hover:text-primary font-medium font-body-md"
              >
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary-container text-white font-semibold text-sm font-body-md hover:bg-primary-container/90 focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-on-surface-variant/60 mt-6 font-body-sm">
          Inventory Management System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
