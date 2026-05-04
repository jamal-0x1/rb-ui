"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing, { type BillingPrefill } from "./Billing";
import {
  createCheckout,
  SHIPPING_LABELS,
  SHIPPING_RATES,
  type CheckoutShippingMethod,
} from "@/lib/orderApi";
import { fetchMyAddresses, type UserAddress } from "@/lib/myAccountApi";
import { selectTotalPrice, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { useAppSelector, type AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { useCurrentUser } from "@/lib/userAuth";

const formatBDT = (n: number) => `৳${n.toLocaleString("en-IN")}`;

const Checkout = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const subtotal = useAppSelector(selectTotalPrice);
  const { user, loading: userLoading } = useCurrentUser();

  const [shippingMethod, setShippingMethod] =
    useState<CheckoutShippingMethod>("standard");
  const [coupon, setCoupon] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);
  const [addressesLoaded, setAddressesLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setDefaultAddress(null);
      setAddressesLoaded(true);
      return;
    }
    let cancelled = false;
    fetchMyAddresses()
      .then((list) => {
        if (cancelled) return;
        const def =
          list.find((a) => a.isDefaultShipping) ??
          list.find((a) => a.isDefaultBilling) ??
          list[0] ??
          null;
        setDefaultAddress(def);
      })
      .catch(() => {
        if (!cancelled) setDefaultAddress(null);
      })
      .finally(() => {
        if (!cancelled) setAddressesLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const billingPrefill = useMemo<BillingPrefill | null>(() => {
    if (!user) return null;
    return {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email,
      country: defaultAddress?.country ?? "Bangladesh",
      address: defaultAddress?.line1 ?? "",
      addressTwo: defaultAddress?.line2 ?? "",
      town: defaultAddress?.city ?? "",
      postalCode: defaultAddress?.postalCode ?? "",
    };
  }, [user, defaultAddress]);

  const billingKey = user
    ? `user-${user.id}-${defaultAddress?.id ?? "none"}`
    : "guest";

  const shippingFee = SHIPPING_RATES[shippingMethod];
  const total = subtotal + shippingFee;

  const checkoutItems = useMemo(
    () =>
      cartItems
        .filter((i) => !!i.variantId)
        .map((i) => ({ variantId: i.variantId as string, quantity: i.quantity })),
    [cartItems],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      router.push(`/signin?next=/checkout`);
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (checkoutItems.length === 0) {
      setError(
        "Cart contains items without a variant. Re-add them from the shop.",
      );
      return;
    }

    const fd = new FormData(e.currentTarget);
    const required = ["firstName", "lastName", "address", "town", "country", "phone", "email"];
    for (const k of required) {
      if (!String(fd.get(k) ?? "").trim()) {
        setError(`Missing required field: ${k}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const order = await createCheckout({
        items: checkoutItems,
        shipping: {
          firstName: String(fd.get("firstName")),
          lastName: String(fd.get("lastName")),
          line1: String(fd.get("address")),
          line2: String(fd.get("addressTwo") ?? "") || undefined,
          city: String(fd.get("town")),
          state: undefined,
          postalCode: String(fd.get("postalCode") ?? "0000"),
          country: String(fd.get("country")),
          phone: String(fd.get("phone")),
          email: String(fd.get("email")),
        },
        paymentMethod: "cod",
        shippingMethod,
        couponCode: coupon || undefined,
        notes: notes || undefined,
      });
      dispatch(removeAllItemsFromCart());
      router.push(`/order-success/${order.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Checkout failed";
      if (msg === "AUTH_REQUIRED") {
        router.push(`/signin?next=/checkout`);
        return;
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {!userLoading && !user && (
            <div className="mb-6 rounded-lg border border-blue/30 bg-blue/5 px-4 py-3 text-sm text-dark">
              You need an account to place an order.{" "}
              <Link href="/signin?next=/checkout" className="text-blue underline">
                Sign in
              </Link>{" "}
              or{" "}
              <Link href="/signup" className="text-blue underline">
                create one
              </Link>
              .
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* left */}
              <div className="lg:max-w-[670px] w-full">
                {!user && <Login />}
                {userLoading || !addressesLoaded ? (
                  <div className="mt-9 bg-white shadow-1 rounded-[10px] p-6 text-dark-4">
                    Loading billing details...
                  </div>
                ) : (
                  <Billing
                    key={billingKey}
                    isLoggedIn={!!user}
                    prefill={billingPrefill ?? undefined}
                  />
                )}

                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <label htmlFor="notes" className="block mb-2.5">
                    Other Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={5}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes about your order, e.g. special delivery instructions."
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              {/* right */}
              <div className="max-w-[455px] w-full">
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <h4 className="font-medium text-dark">Product</h4>
                      <h4 className="font-medium text-dark text-right">
                        Subtotal
                      </h4>
                    </div>

                    {cartItems.length === 0 ? (
                      <p className="py-5 text-center text-dark-4">
                        Cart is empty.{" "}
                        <Link href="/shop" className="text-blue underline">
                          Continue shopping
                        </Link>
                      </p>
                    ) : (
                      cartItems.map((item) => (
                        <div
                          key={item.lineId}
                          className="flex items-start justify-between py-5 border-b border-gray-3 gap-4"
                        >
                          <div className="flex-1">
                            <p className="text-dark line-clamp-2">
                              {item.title}
                              {item.quantity > 1 && (
                                <span className="text-dark-4 text-custom-sm">
                                  {" "}
                                  × {item.quantity}
                                </span>
                              )}
                            </p>
                            {(item.variantColor || item.variantSize) && (
                              <p className="text-xs text-dark-4 mt-0.5">
                                {[item.variantColor, item.variantSize]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                          </div>
                          <p className="text-dark text-right">
                            {formatBDT(item.discountedPrice * item.quantity)}
                          </p>
                        </div>
                      ))
                    )}

                    <div className="flex items-center justify-between py-3 border-b border-gray-3">
                      <p className="text-dark">Subtotal</p>
                      <p className="text-dark text-right">
                        {formatBDT(subtotal)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-gray-3">
                      <p className="text-dark">
                        {SHIPPING_LABELS[shippingMethod]}
                      </p>
                      <p className="text-dark text-right">
                        {formatBDT(shippingFee)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark">Total</p>
                      <p className="font-medium text-lg text-dark text-right">
                        {formatBDT(total)}
                      </p>
                    </div>
                  </div>
                </div>

                <Coupon
                  value={coupon}
                  onApply={(c) => setCoupon(c)}
                  onClear={() => setCoupon("")}
                />

                <ShippingMethod
                  value={shippingMethod}
                  onChange={setShippingMethod}
                />

                <PaymentMethod />

                {error && (
                  <div className="mt-6 rounded-lg border border-red/30 bg-red/5 px-4 py-3 text-sm text-red">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Placing order..." : "Place Order"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
