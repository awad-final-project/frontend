import { cva, VariantProps } from "class-variance-authority";
import React from "react";

import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-4xl font-bold",
      h2: "text-3xl font-bold",
      h3: "text-2xl font-semibold",
      h4: "text-xl font-semibold",
      h5: "text-lg font-semibold",
      h6: "text-base font-medium",
      subtitle1: "text-base font-medium",
      subtitle2: "text-sm font-semibold",
      body1: "text-base",
      body2: "text-sm",
      caption: "text-xs italic",
      overline: "text-xs",
    },
  },
  defaultVariants: {
    variant: "body1",
  },
});

type TypographyProps = React.AllHTMLAttributes<HTMLElement> &
  VariantProps<typeof typographyVariants>;

const Typography = React.forwardRef<
  HTMLHeadingElement | HTMLParagraphElement | HTMLDivElement,
  TypographyProps
>(({ variant = "body1", children, className, ...props }, ref) => {
  const Comp = "p";
  return (
    <Comp ref={ref} className={cn(typographyVariants({ variant }), className)} {...props}>
      {children}
    </Comp>
  );
});
Typography.displayName = "Typography";

export { Typography, typographyVariants };
