import * as React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export function Card({ padded = true, style, ...props }: Props) {
  return (
    <div
      {...props}
      style={{
        border: "1px solid rgba(var(--border), var(--border-alpha))",
        background: "rgba(var(--panel), var(--panel-alpha))",
        borderRadius: 18,
        backdropFilter: "blur(10px)",
        boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
        padding: padded ? 14 : 0,
        ...style,
      }}
    />
  );
}
