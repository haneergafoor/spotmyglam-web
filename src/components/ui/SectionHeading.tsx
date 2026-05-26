import type { HTMLAttributes } from "react";

type SectionHeadingProps = HTMLAttributes<HTMLHeadingElement>;

export const SectionHeading = ({ className, ...props }: SectionHeadingProps) => (
  <h2
    className={[
      "font-display text-2xl font-semibold tracking-tight text-black",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
);