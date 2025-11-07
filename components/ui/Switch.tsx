"use client";

import { useRef } from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  title?: string;
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  size = "md",
  className = "",
  title,
}: SwitchProps) {
  const switchRef = useRef<HTMLButtonElement>(null);

  const sizeClasses = {
    sm: {
      track: "w-8 h-4",
      thumb: "w-3 h-3",
      translateX: "18px", // 32px (w-8) - 12px (w-3) + 2px padding
      translateXOff: "2px",
    },
    md: {
      track: "w-11 h-6",
      thumb: "w-5 h-5",
      translateX: "24px", // 44px (w-11) - 20px (w-5) + 2px padding
      translateXOff: "2px",
    },
    lg: {
      track: "w-14 h-7",
      thumb: "w-6 h-6",
      translateX: "30px", // 56px (w-14) - 24px (w-6) + 2px padding
      translateXOff: "2px",
    },
  };

  const sizes = sizeClasses[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        ref={switchRef}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        title={title}
        className={`
          ${sizes.track}
          relative inline-flex items-center rounded-full
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800
          ${
            checked
              ? "bg-blue-600 dark:bg-blue-500"
              : "bg-gray-300 dark:bg-gray-600"
          }
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:shadow-md active:scale-95"
          }
        `}
        style={{
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <span
          className={`
            ${sizes.thumb}
            inline-block rounded-full bg-white shadow-lg
            will-change-transform
          `}
          style={{
            transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            transform: checked
              ? `translateX(${sizes.translateX})`
              : `translateX(${sizes.translateXOff})`,
          }}
        />
      </button>
      {label && (
        <label
          className={`
            text-sm text-gray-700 dark:text-gray-300
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            ${size === "sm" ? "text-xs" : size === "lg" ? "text-base" : ""}
          `}
          onClick={!disabled ? handleToggle : undefined}
        >
          {label}
        </label>
      )}
    </div>
  );
}
