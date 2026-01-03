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
    borderRadius: 14,
    border: "1px solid rgba(var(--border), var(--border-alpha))",
    fontWeight: 900,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "transform 120ms ease, box-shadow 160ms ease, background 160ms ease",
    userSelect: "none",
  };

  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: "10px 12px", fontSize: 13 },
    md: { padding: "12px 14px", fontSize: 14 },
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background:
        "linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)",
      color: "#0B1222", // dark navy text for contrast
      boxShadow: "0 18px 60px rgba(56,122,255,0.35)",
    },
    ghost: {
      background: "rgba(var(--panel), var(--panel-alpha))",
      color: "rgb(var(--text))",
      border: "1px solid rgba(var(--border), 0.12)",
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
        opacity: disabled ? 0.65 : 1,
        ...style,
      }}
      onMouseDown={(e) => {
        if (!disabled) (e.currentTarget.style.transform = "scale(0.98)");
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        props.onMouseUp?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        props.onMouseLeave?.(e);
      }}
    />
  );
}
