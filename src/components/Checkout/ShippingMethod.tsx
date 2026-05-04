"use client";
import React from "react";
import {
  SHIPPING_LABELS,
  SHIPPING_RATES,
  type CheckoutShippingMethod,
} from "@/lib/orderApi";

type Props = {
  value: CheckoutShippingMethod;
  onChange: (value: CheckoutShippingMethod) => void;
};

const METHODS: CheckoutShippingMethod[] = ["free", "standard", "express"];

const formatBDT = (n: number) => `৳${n.toLocaleString("en-IN")}`;

const ShippingMethod = ({ value, onChange }: Props) => (
  <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
    <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
      <h3 className="font-medium text-xl text-dark">Shipping Method</h3>
    </div>

    <div className="p-4 sm:p-8.5">
      <div className="flex flex-col gap-4">
        {METHODS.map((m) => {
          const active = value === m;
          return (
            <label
              key={m}
              htmlFor={`ship-${m}`}
              className="flex cursor-pointer select-none items-center gap-3.5"
            >
              <div className="relative">
                <input
                  type="radio"
                  name="shippingMethod"
                  id={`ship-${m}`}
                  value={m}
                  checked={active}
                  onChange={() => onChange(m)}
                  className="sr-only"
                />
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    active ? "border-4 border-blue" : "border border-gray-4"
                  }`}
                />
              </div>
              <div
                className={`flex-1 rounded-md border-[0.5px] py-3.5 px-5 transition ${
                  active
                    ? "border-transparent bg-gray-2"
                    : "border-gray-4 shadow-1 hover:bg-gray-2"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-dark">{SHIPPING_LABELS[m]}</p>
                  <p className="font-semibold text-dark">
                    {formatBDT(SHIPPING_RATES[m])}
                  </p>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  </div>
);

export default ShippingMethod;
