"use client";
import React from "react";

const PaymentMethod = () => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Payment Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <label
          htmlFor="cod"
          className="flex cursor-pointer select-none items-center gap-4"
        >
          <input
            type="radio"
            name="payment"
            id="cod"
            value="cod"
            defaultChecked
            className="sr-only"
            readOnly
          />
          <div className="flex h-4 w-4 items-center justify-center rounded-full border-4 border-blue" />
          <div className="rounded-md border-[0.5px] border-transparent bg-gray-2 py-3.5 px-5">
            <p className="font-medium text-dark">Cash on Delivery (COD)</p>
            <p className="text-custom-xs text-dark-4">
              Pay with cash when your order arrives.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethod;
