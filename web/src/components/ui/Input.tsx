"use client";

import * as React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ style, ...props }: Props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "14px 16px",
        fontSize: 15,
        borderRadius: 10,
        border: "1px solid rgba(var(--border), 0.6)",
        background: "rgba(var(--panel-alt, 28 35 56), 0.95)",
        color: "rgb(var(--text))",
        outline: "none",
        transition: "border-color 150ms ease, box-shadow 150ms ease",
        lineHeight: 1.4,
        ...style,
      }}

      onFocus={(e) => {
        e.currentTarget.style.borderColor = "rgba(var(--primary), 0.8)";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(var(--primary), 0.15)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "rgba(var(--border), 0.6)";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}
