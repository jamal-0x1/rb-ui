"use client";
import React, { useState, useEffect, useRef } from "react";

type Option = { label: string; value: string };

type Props = {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
};

const CustomSelect = ({ options, value, onChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleOptionClick = (option: Option) => {
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div
      className="custom-select custom-select-2 flex-shrink-0 relative"
      ref={selectRef}
    >
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options
          .filter((o) => o.value !== selectedOption.value)
          .map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionClick(option)}
              className="select-item"
            >
              {option.label}
            </div>
          ))}
      </div>
    </div>
  );
};

export default CustomSelect;
