import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = ({
  variant = "primary",
  className,
  ...props
}: ButtonProps) => (
  <button
    className={[
      "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition",
      variant === "primary" &&
        "bg-black text-white hover:bg-[#1c1c1c] disabled:bg-[#3a3a3a]",
      variant === "secondary" &&
        "border border-black/20 bg-white text-black hover:border-black",
      variant === "ghost" && "text-black hover:bg-black/5",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
);