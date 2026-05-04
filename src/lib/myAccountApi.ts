"use client";

import { PUBLIC_API_URL } from "./publicApi";
import { getUserToken } from "./userAuth";

export type UserAddress = {
  id: string;
  userId: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: string;
};

export type AddressInput = {
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
};

export type ProfileUpdateInput = {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  currentPassword?: string;
};

async function authedFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getUserToken();
  if (!token) throw new Error("AUTH_REQUIRED");

  const res = await fetch(`${PUBLIC_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...((init.headers as Record<string, string>) ?? {}),
    },
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    if (res.status === 401) throw new Error("AUTH_REQUIRED");
    const msg = data?.message ?? res.statusText;
    throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
  }
  return data as T;
}

export function fetchMyAddresses() {
  return authedFetch<UserAddress[]>("/addresses/mine");
}

export function createMyAddress(body: AddressInput) {
  return authedFetch<UserAddress>("/addresses/mine", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateMyAddress(id: string, body: Partial<AddressInput>) {
  return authedFetch<UserAddress>(`/addresses/mine/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteMyAddress(id: string) {
  return authedFetch<{ id: string }>(`/addresses/mine/${id}`, {
    method: "DELETE",
  });
}

export function updateMyProfile(body: ProfileUpdateInput) {
  return authedFetch("/auth/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
