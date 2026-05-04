"use client";
import React, { useState } from "react";

type Props = {
  value: string;
  onApply: (code: string) => void;
  onClear: () => void;
};

const Coupon = ({ value, onApply, onClear }: Props) => {
  const [draft, setDraft] = useState(value);

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">
          {value ? `Coupon applied: ${value}` : "Have any Coupon Code?"}
        </h3>
      </div>

      <div className="py-8 px-4 sm:px-8.5">
        <div className="flex gap-4">
          <input
            type="text"
            name="coupon"
            id="coupon"
            value={draft}
            onChange={(e) => setDraft(e.target.value.trim().toUpperCase())}
            placeholder="Enter coupon code"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />

          {value ? (
            <button
              type="button"
              onClick={() => {
                setDraft("");
                onClear();
              }}
              className="inline-flex font-medium text-dark bg-gray-2 py-3 px-6 rounded-md hover:bg-gray-3"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={() => draft && onApply(draft)}
              className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md hover:bg-blue-dark"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Coupon;
