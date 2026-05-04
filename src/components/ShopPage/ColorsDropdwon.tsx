"use client";
import React, { useState } from "react";

const COLOR_HEX: Record<string, string> = {
  black: "#111827",
  white: "#f9fafb",
  silver: "#c0c4cc",
  graphite: "#3f4043",
  "pale gray": "#d1d5db",
  "space gray": "#4b5563",
  midnight: "#1f2937",
  starlight: "#ede9d8",
  titanium: "#9aa0a6",
  blue: "#3b82f6",
  red: "#ef4444",
  green: "#22c55e",
  purple: "#a855f7",
  pink: "#ec4899",
  orange: "#f97316",
  yellow: "#eab308",
  brown: "#92400e",
  gold: "#d4af37",
  rose: "#f43f5e",
};

function colorToHex(name: string): string {
  return COLOR_HEX[name.toLowerCase()] ?? "#9ca3af";
}

type Props = {
  colors: { value: string; count: number }[];
  selected: string[];
  onToggle: (value: string) => void;
};

const ColorsDropdwon = ({ colors, selected, onToggle }: Props) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  if (colors.length === 0) return null;

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">Colors</p>
        <button
          type="button"
          aria-label="button for colors dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div
        className={`flex-wrap gap-2.5 p-6 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        {colors.map(({ value, count }) => {
          const isActive = selected.includes(value);
          const hex = colorToHex(value);
          return (
            <button
              type="button"
              key={value}
              onClick={() => onToggle(value)}
              aria-label={`Filter by color ${value}`}
              title={`${value} (${count})`}
              className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                isActive ? "border-blue" : "border-transparent"
              }`}
            >
              <span
                className="block w-4 h-4 rounded-full ring-1 ring-gray-3"
                style={{ backgroundColor: hex }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorsDropdwon;
