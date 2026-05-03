"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api, clearToken, getToken } from "@/lib/admin/api";
import { Skeleton } from "@/components/ui/skeleton";

type Me = {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
};

type Ctx = { user: Me | null; loading: boolean };

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<Ctx>({ user: null, loading: true });

  useEffect(() => {
    if (pathname === "/admin/login") {
      setState({ user: null, loading: false });
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    api<Me>("/auth/me")
      .then((user) => {
        if (user.role !== "admin") {
          clearToken();
          router.replace("/admin/login?error=not-admin");
          return;
        }
        setState({ user, loading: false });
      })
      .catch(() => {
        clearToken();
        router.replace("/admin/login");
      });
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;

  if (state.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col gap-3 w-64">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  if (!state.user) return null;

  return <>{children}</>;
}
