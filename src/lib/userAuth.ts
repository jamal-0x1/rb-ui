"use client";

import { useEffect, useState } from "react";
import { PUBLIC_API_URL } from "./publicApi";

const TOKEN_KEY = "rb_user_token";

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "customer" | "admin" | string;
  emailVerified?: boolean;
};

export type AuthResponse = {
  accessToken: string;
  user: CurrentUser;
};

export function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setUserToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("rb-user-changed"));
}

export function clearUserToken() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("rb-user-changed"));
}

async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getUserToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${PUBLIC_API_URL}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.message ?? res.statusText;
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
  return data as T;
}

export async function loginUser(email: string, password: string) {
  const res = await authFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setUserToken(res.accessToken);
  return res;
}

export async function registerUser(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  const res = await authFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setUserToken(res.accessToken);
  return res;
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  if (!getUserToken()) return null;
  try {
    return await authFetch<CurrentUser>("/auth/me");
  } catch {
    clearUserToken();
    return null;
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const u = await fetchCurrentUser();
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    };
    load();
    const onChange = () => load();
    window.addEventListener("rb-user-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener("rb-user-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  return { user, loading };
}
