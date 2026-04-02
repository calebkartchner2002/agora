"use client";

import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
};

export function Button({
  variant = "primary",
  size = "md",
  style,
  disabled,
  ...props
}: Props) {
  const base: React.CSSProperties = {
    borderRadius: 10,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "transform 120ms ease, box-shadow 160ms ease, background 160ms ease, opacity 160ms ease",
    userSelect: "none",
    letterSpacing: "0.01em",
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: "8px 14px", fontSize: 13 },
    md: { padding: "11px 20px", fontSize: 14 },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: "rgb(var(--primary))",
      color: "#ffffff",
      border: "1px solid rgba(var(--primary-light), 0.4)",
      boxShadow: "0 0 0 0 rgba(var(--primary), 0)",
    },
    ghost: {
      background: "rgba(var(--border), 0.18)",
      color: "rgb(var(--text))",
      border: "1px solid rgba(var(--border), 0.55)",
    },
  };

  return (
    <button
      {...props}
      disabled={disabled}
      style={{
        ...base,
        ...sizes[size],
        ...variants[variant],
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          if (variant === "primary") {
            e.currentTarget.style.background = "rgb(var(--primary-light))";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(var(--primary), 0.45)";
          } else {
            e.currentTarget.style.background = "rgba(var(--border), 0.3)";
          }
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.background = "rgb(var(--primary))";
          e.currentTarget.style.boxShadow = "0 0 0 0 rgba(var(--primary), 0)";
        } else {
          e.currentTarget.style.background = "rgba(var(--border), 0.18)";
        }
        e.currentTarget.style.transform = "scale(1)";
        props.onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.97)";
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        props.onMouseUp?.(e);
      }}
    />
  );
}
