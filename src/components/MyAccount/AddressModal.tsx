"use client";

import React, { useEffect, useState } from "react";
import {
  createMyAddress,
  updateMyAddress,
  type AddressInput,
  type UserAddress,
} from "@/lib/myAccountApi";

const COUNTRIES = [
  "Bangladesh",
  "India",
  "Pakistan",
  "Sri Lanka",
  "Nepal",
  "Bhutan",
  "Maldives",
  "United States",
  "United Kingdom",
];

const empty: AddressInput = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Bangladesh",
  isDefaultShipping: false,
  isDefaultBilling: false,
};

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  initial?: UserAddress | null;
  onSaved: (a: UserAddress) => void;
};

const AddressModal = ({ isOpen, closeModal, initial, onSaved }: Props) => {
  const [form, setForm] = useState<AddressInput>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (initial) {
      setForm({
        label: initial.label ?? "",
        line1: initial.line1,
        line2: initial.line2 ?? "",
        city: initial.city,
        state: initial.state ?? "",
        postalCode: initial.postalCode,
        country: initial.country,
        isDefaultShipping: initial.isDefaultShipping,
        isDefaultBilling: initial.isDefaultBilling,
      });
    } else {
      setForm(empty);
    }
    setError(null);
  }, [isOpen, initial]);

  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".modal-content")) closeModal();
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen, closeModal]);

  const set = <K extends keyof AddressInput>(key: K, value: AddressInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.line1.trim() || !form.city.trim() || !form.postalCode.trim()) {
      setError("Address line, city, and postal code are required.");
      return;
    }
    setSubmitting(true);
    try {
      const saved = initial
        ? await updateMyAddress(initial.id, form)
        : await createMyAddress(form);
      onSaved(saved);
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[100px] bg-dark/70 sm:px-8 px-4 py-5 ${
        isOpen ? "block z-99999" : "hidden"
      }`}
    >
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[800px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close modal"
            className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-full bg-meta text-body hover:text-dark"
          >
            ✕
          </button>

          <h3 className="font-medium text-xl text-dark mb-5">
            {initial ? "Edit address" : "Add address"}
          </h3>

          {error && (
            <div className="mb-4 rounded-md border border-red/30 bg-red/5 px-4 py-2.5 text-sm text-red">
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label htmlFor="label" className="block mb-2.5">
                  Label (optional)
                </label>
                <input
                  id="label"
                  type="text"
                  value={form.label ?? ""}
                  onChange={(e) => set("label", e.target.value)}
                  placeholder="Home, Office..."
                  className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div>
                <label htmlFor="country" className="block mb-2.5">
                  Country <span className="text-red">*</span>
                </label>
                <select
                  id="country"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="line1" className="block mb-2.5">
                Street address <span className="text-red">*</span>
              </label>
              <input
                id="line1"
                type="text"
                value={form.line1}
                onChange={(e) => set("line1", e.target.value)}
                placeholder="House no, road name, area"
                className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
              />
            </div>

            <div className="mb-5">
              <label htmlFor="line2" className="block mb-2.5">
                Apartment / unit (optional)
              </label>
              <input
                id="line2"
                type="text"
                value={form.line2 ?? ""}
                onChange={(e) => set("line2", e.target.value)}
                className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
              <div>
                <label htmlFor="city" className="block mb-2.5">
                  City <span className="text-red">*</span>
                </label>
                <input
                  id="city"
                  type="text"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div>
                <label htmlFor="state" className="block mb-2.5">
                  Division / state
                </label>
                <input
                  id="state"
                  type="text"
                  value={form.state ?? ""}
                  onChange={(e) => set("state", e.target.value)}
                  className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div>
                <label htmlFor="postalCode" className="block mb-2.5">
                  Postal code <span className="text-red">*</span>
                </label>
                <input
                  id="postalCode"
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                  className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mb-7">
              <label className="flex items-center gap-2 text-sm text-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.isDefaultShipping}
                  onChange={(e) => set("isDefaultShipping", e.target.checked)}
                  className="h-4 w-4 accent-blue"
                />
                Default shipping
              </label>
              <label className="flex items-center gap-2 text-sm text-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.isDefaultBilling}
                  onChange={(e) => set("isDefaultBilling", e.target.checked)}
                  className="h-4 w-4 accent-blue"
                />
                Default billing
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md hover:bg-blue-dark disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex font-medium text-dark bg-gray-2 py-3 px-7 rounded-md hover:bg-gray-3"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;
