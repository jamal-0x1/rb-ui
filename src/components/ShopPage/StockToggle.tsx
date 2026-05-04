"use client";

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
};

const StockToggle = ({ value, onChange }: Props) => (
  <div className="bg-white shadow-1 rounded-lg py-4 px-5 flex items-center justify-between">
    <p className="text-dark">In stock only</p>
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors ${
        value ? "bg-blue" : "bg-gray-3"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

export default StockToggle;
