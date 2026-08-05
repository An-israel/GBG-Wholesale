import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none min-h-[44px] rounded-[var(--radius-input)] text-[15px]",
  {
    variants: {
      variant: {
        // Primary — filled navy. One per viewport.
        primary: "bg-navy text-cream hover:bg-navy-hover px-6",
        // Gold CTA
        gold: "bg-gold text-navy hover:bg-gold-hover px-6 font-bold",
        // Outline
        outline: "border border-navy text-navy hover:bg-navy hover:text-cream px-6",
        // Ghost / text link styled as a button
        ghost: "text-navy hover:bg-gold-pale px-4",
        // Destructive
        danger: "bg-danger text-white hover:opacity-90 px-6",
      },
      size: {
        sm: "min-h-[40px] text-sm px-4",
        md: "",
        lg: "min-h-[52px] text-base px-8",
        full: "w-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";

interface ButtonLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  href: string;
}

export function ButtonLink({ className, variant, size, href, ...props }: ButtonLinkProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  const isExternal = href.startsWith("http") || href.startsWith("https://wa.me");
  if (isExternal) {
    return <a href={href} className={classes} {...props} />;
  }
  return <Link href={href} className={classes} {...props} />;
}

export { buttonVariants };
