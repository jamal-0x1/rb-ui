"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, setToken } from "@/lib/admin/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (search.get("error") === "not-admin") {
      setErr("Account is not an admin.");
    }
  }, [search]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await api<{ accessToken: string; user: { role: string } }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      );
      if (res.user.role !== "admin") {
        setErr("Account is not an admin.");
        return;
      }
      setToken(res.accessToken);
      router.replace("/admin/dash");
    } catch (e: any) {
      setErr(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-slate-200 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold mb-1">Admin sign in</h1>
        <p className="text-sm text-slate-500 mb-6">rb-admin portal</p>

        {err && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
