import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, ...props }: InputProps) => (
  <input
    className={[
      "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40",
      "focus:outline-none focus:ring-2 focus:ring-black/50",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
);
