"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, setToken } from "@/lib/admin/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin sign in</CardTitle>
          <CardDescription>rb-admin portal</CardDescription>
        </CardHeader>
        <CardContent>
          {err && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {err}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="admin@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
