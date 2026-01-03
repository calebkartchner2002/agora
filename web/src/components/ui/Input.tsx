"use client";

import * as React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ style, ...props }: Props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "16px 16px",        // slightly smaller than before
        fontSize: 16,
        borderRadius: 16,
        border: "1px solid rgba(var(--border), 0.45)",
        background:
            "linear-gradient(180deg, rgba(var(--panel), 0.18), rgba(var(--panel), 0.10))",
        color: "rgb(var(--text))",
        outline: "none",
        boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08)",
        lineHeight: 1.35,
        ...style,
      }}

      onFocus={(e) => {
        e.currentTarget.style.border = "1px solid rgba(var(--primary), 0.55)";
        e.currentTarget.style.boxShadow = "0 0 0 4px rgba(99,102,241,0.18)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.border = "1px solid rgba(var(--border), 0.12)";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}
