"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  UserCog,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import Breadcrumb from "../Common/Breadcrumb";
import AddressModal from "./AddressModal";
import {
  fetchMyOrders,
  type Order,
} from "@/lib/orderApi";
import {
  fetchMyAddresses,
  deleteMyAddress,
  updateMyProfile,
  type UserAddress,
} from "@/lib/myAccountApi";
import {
  useCurrentUser,
  clearUserToken,
  fetchCurrentUser,
} from "@/lib/userAuth";

type TabKey = "dashboard" | "orders" | "addresses" | "profile";

const TABS: { key: TabKey; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "orders", label: "Orders", Icon: ShoppingBag },
  { key: "addresses", label: "Addresses", Icon: MapPin },
  { key: "profile", label: "Account Details", Icon: UserCog },
];

const formatBDT = (n: number | string) =>
  `৳${Number(n).toLocaleString("en-IN")}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue/10 text-blue",
  shipped: "bg-blue/10 text-blue",
  delivered: "bg-green/10 text-green",
  cancelled: "bg-red/10 text-red",
  refunded: "bg-gray-200 text-dark-3",
};

const VALID_TABS: TabKey[] = ["dashboard", "orders", "addresses", "profile"];

const MyAccount = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useCurrentUser();

  const initialTab = (() => {
    const t = searchParams.get("tab") as TabKey | null;
    return t && VALID_TABS.includes(t) ? t : "dashboard";
  })();

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [addresses, setAddresses] = useState<UserAddress[] | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    if (!user) router.replace("/signin?next=/my-account");
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;
    if ((activeTab === "dashboard" || activeTab === "orders") && orders === null) {
      setOrdersLoading(true);
      fetchMyOrders()
        .then(setOrders)
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
    if (activeTab === "addresses" && addresses === null) {
      setAddressesLoading(true);
      fetchMyAddresses()
        .then(setAddresses)
        .catch(() => setAddresses([]))
        .finally(() => setAddressesLoading(false));
    }
  }, [activeTab, user, orders, addresses]);

  const onLogout = () => {
    clearUserToken();
    router.replace("/");
  };

  const onAddressSaved = (saved: UserAddress) => {
    setAddresses((prev) => {
      if (!prev) return [saved];
      const idx = prev.findIndex((a) => a.id === saved.id);
      if (idx === -1) return [saved, ...prev];
      const copy = prev.slice();
      copy[idx] = saved;
      return copy;
    });
  };

  const onAddressDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await deleteMyAddress(id);
      setAddresses((prev) => prev?.filter((a) => a.id !== id) ?? null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (userLoading || !user) {
    return (
      <>
        <Breadcrumb title="My Account" pages={["my account"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] mx-auto px-4 text-center text-dark-4">
            Loading...
          </div>
        </section>
      </>
    );
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email;
  const initials = (
    (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? user.email[0])
  ).toUpperCase();

  return (
    <>
      <Breadcrumb title="My Account" pages={["my account"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            <div className="xl:max-w-[300px] w-full bg-white rounded-xl shadow-1">
              <div className="flex flex-wrap items-center gap-4 py-6 px-6 border-b border-gray-3">
                <div className="w-14 h-14 rounded-full bg-blue/10 text-blue font-semibold flex items-center justify-center text-lg">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-dark truncate">{fullName}</p>
                  <p className="text-custom-xs text-dark-4 truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-1.5">
                {TABS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-2.5 rounded-md py-2.5 px-4 text-left transition-colors ${
                      activeTab === key
                        ? "bg-blue text-white"
                        : "text-dark hover:bg-gray-1"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-2.5 rounded-md py-2.5 px-4 text-left text-dark hover:bg-gray-1 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-1 p-6 sm:p-9">
              {activeTab === "dashboard" && (
                <DashboardPanel
                  user={user}
                  orders={orders}
                  ordersLoading={ordersLoading}
                  onSeeAllOrders={() => setActiveTab("orders")}
                  onSeeAddresses={() => setActiveTab("addresses")}
                />
              )}

              {activeTab === "orders" && (
                <OrdersPanel orders={orders} loading={ordersLoading} />
              )}

              {activeTab === "addresses" && (
                <AddressesPanel
                  addresses={addresses}
                  loading={addressesLoading}
                  onAdd={() => {
                    setEditingAddress(null);
                    setAddressModalOpen(true);
                  }}
                  onEdit={(a) => {
                    setEditingAddress(a);
                    setAddressModalOpen(true);
                  }}
                  onDelete={onAddressDelete}
                />
              )}

              {activeTab === "profile" && (
                <ProfilePanel
                  user={user}
                  onUpdated={() => {
                    void fetchCurrentUser();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <AddressModal
        isOpen={addressModalOpen}
        closeModal={() => setAddressModalOpen(false)}
        initial={editingAddress}
        onSaved={onAddressSaved}
      />
    </>
  );
};

// ---- Dashboard panel ----

type DashboardPanelProps = {
  user: { firstName: string | null; email: string };
  orders: Order[] | null;
  ordersLoading: boolean;
  onSeeAllOrders: () => void;
  onSeeAddresses: () => void;
};

const DashboardPanel = ({
  user,
  orders,
  ordersLoading,
  onSeeAllOrders,
  onSeeAddresses,
}: DashboardPanelProps) => {
  const recent = orders?.slice(0, 3) ?? [];
  return (
    <div>
      <h2 className="font-medium text-xl text-dark mb-3">
        Welcome back{user.firstName ? `, ${user.firstName}` : ""} 👋
      </h2>
      <p className="text-dark-4 mb-7">
        Manage your orders, addresses, and account details from this dashboard.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-9">
        <StatTile label="Orders" value={orders ? orders.length : "—"} />
        <StatTile
          label="Email"
          value={user.email}
          small
        />
        <StatTile label="Account" value="Customer" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-dark">Recent orders</h3>
        <button
          type="button"
          onClick={onSeeAllOrders}
          className="text-sm text-blue hover:underline"
        >
          View all
        </button>
      </div>

      {ordersLoading ? (
        <p className="text-dark-4 text-sm">Loading...</p>
      ) : recent.length === 0 ? (
        <p className="text-dark-4 text-sm">
          No orders yet.{" "}
          <Link href="/shop" className="text-blue hover:underline">
            Start shopping
          </Link>
        </p>
      ) : (
        <OrdersTable orders={recent} compact />
      )}

      <div className="mt-10 rounded-md border border-gray-3 p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-dark">Saved addresses</p>
          <p className="text-sm text-dark-4">
            Manage shipping addresses for faster checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={onSeeAddresses}
          className="text-sm font-medium text-blue hover:underline"
        >
          Manage →
        </button>
      </div>
    </div>
  );
};

const StatTile = ({
  label,
  value,
  small,
}: {
  label: string;
  value: string | number;
  small?: boolean;
}) => (
  <div className="rounded-lg border border-gray-3 px-5 py-4">
    <p className="text-xs uppercase tracking-wide text-dark-4 mb-1">{label}</p>
    <p
      className={`text-dark font-medium truncate ${
        small ? "text-sm" : "text-lg"
      }`}
    >
      {value}
    </p>
  </div>
);

// ---- Orders panel ----

const OrdersPanel = ({
  orders,
  loading,
}: {
  orders: Order[] | null;
  loading: boolean;
}) => {
  if (loading) return <p className="text-dark-4">Loading orders...</p>;
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-dark-4 mb-3">You haven&apos;t placed any orders yet.</p>
        <Link href="/shop" className="text-blue hover:underline">
          Start shopping
        </Link>
      </div>
    );
  }
  return (
    <div>
      <h2 className="font-medium text-xl text-dark mb-5">Your orders</h2>
      <OrdersTable orders={orders} />
    </div>
  );
};

const OrdersTable = ({
  orders,
  compact,
}: {
  orders: Order[];
  compact?: boolean;
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-dark-4 border-b border-gray-3">
          <th className="py-3 pr-3">Order</th>
          <th className="py-3 pr-3">Date</th>
          <th className="py-3 pr-3">Status</th>
          <th className="py-3 pr-3 text-right">Total</th>
          {!compact && <th className="py-3 pr-3 text-right">Action</th>}
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id} className="border-b border-gray-3 last:border-0">
            <td className="py-4 pr-3 font-medium text-dark whitespace-nowrap">
              {o.orderNumber}
            </td>
            <td className="py-4 pr-3 text-dark whitespace-nowrap">
              {formatDate(o.placedAt)}
            </td>
            <td className="py-4 pr-3">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                  STATUS_STYLES[o.status] ?? "bg-gray-200 text-dark-3"
                }`}
              >
                {o.status}
              </span>
            </td>
            <td className="py-4 pr-3 text-dark text-right whitespace-nowrap">
              {formatBDT(o.grandTotal)}
            </td>
            {!compact && (
              <td className="py-4 pr-3 text-right">
                <Link
                  href={`/order-success/${o.id}`}
                  aria-label="View order"
                  className="inline-flex items-center justify-center text-dark-4 hover:text-blue"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ---- Addresses panel ----

const AddressesPanel = ({
  addresses,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: {
  addresses: UserAddress[] | null;
  loading: boolean;
  onAdd: () => void;
  onEdit: (a: UserAddress) => void;
  onDelete: (id: string) => void;
}) => (
  <div>
    <div className="flex items-center justify-between mb-5">
      <h2 className="font-medium text-xl text-dark">Saved addresses</h2>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue py-2 px-4 rounded-md hover:bg-blue-dark"
      >
        <Plus className="w-4 h-4" /> New address
      </button>
    </div>

    {loading ? (
      <p className="text-dark-4">Loading addresses...</p>
    ) : !addresses || addresses.length === 0 ? (
      <p className="text-dark-4 py-4">No addresses saved yet.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <div
            key={a.id}
            className="rounded-lg border border-gray-3 p-5 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              <p className="font-medium text-dark">
                {a.label || "Address"}
              </p>
              {a.isDefaultShipping && (
                <span className="text-xs rounded-full px-2 py-0.5 bg-blue/10 text-blue">
                  Default shipping
                </span>
              )}
              {a.isDefaultBilling && (
                <span className="text-xs rounded-full px-2 py-0.5 bg-green/10 text-green">
                  Default billing
                </span>
              )}
            </div>
            <p className="text-sm text-dark-3 leading-relaxed flex-1">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
              <br />
              {a.city}
              {a.state ? `, ${a.state}` : ""} {a.postalCode}
              <br />
              {a.country}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => onEdit(a)}
                className="inline-flex items-center gap-1.5 text-sm text-blue hover:underline"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(a.id)}
                className="inline-flex items-center gap-1.5 text-sm text-red hover:underline ml-auto"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ---- Profile panel ----

type ProfileUser = {
  firstName: string | null;
  lastName: string | null;
  email: string;
};

const ProfilePanel = ({
  user,
  onUpdated,
}: {
  user: ProfileUser;
  onUpdated: () => void;
}) => {
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [email, setEmail] = useState(user.email);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: {
        firstName?: string;
        lastName?: string;
        email?: string;
        password?: string;
        currentPassword?: string;
      } = {};
      if (firstName !== (user.firstName ?? "")) payload.firstName = firstName;
      if (lastName !== (user.lastName ?? "")) payload.lastName = lastName;
      if (email !== user.email) payload.email = email;
      if (newPassword) {
        payload.password = newPassword;
        payload.currentPassword = currentPassword;
      }

      if (Object.keys(payload).length === 0) {
        setError("Nothing to update.");
        return;
      }

      await updateMyProfile(payload);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="font-medium text-xl text-dark mb-5">Account details</h2>

      {error && (
        <div className="mb-4 rounded-md border border-red/30 bg-red/5 px-4 py-2.5 text-sm text-red">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md border border-green/30 bg-green/5 px-4 py-2.5 text-sm text-green">
          Profile updated.
        </div>
      )}

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <label htmlFor="firstName" className="block mb-2.5">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block mb-2.5">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="block mb-2.5">
            Email <span className="text-red">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <h3 className="font-medium text-dark mt-9 mb-4">Change password</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
          <div>
            <label htmlFor="currentPassword" className="block mb-2.5">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block mb-2.5">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-2.5">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md hover:bg-blue-dark disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
};

export default MyAccount;
