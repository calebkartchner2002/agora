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
        background: "rgb(var(--panel))",
        borderRadius: 16,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        padding: padded ? 20 : 0,
        ...style,
      }}
    />
  );
}
