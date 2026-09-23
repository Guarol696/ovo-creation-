import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "dark" | "light" | "outline-light" | "outline-dark" | "ghost-light";
type ButtonSize = "md" | "lg";

const base =
  "group inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-linear-to-r from-sun-400 to-sun-600 text-night-950 shadow-lg shadow-sun-500/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sun-500/35",
  dark: "bg-night-950 text-white shadow-lg shadow-night-950/25 hover:-translate-y-0.5 hover:bg-night-900 hover:shadow-xl",
  light: "bg-white text-night-950 shadow-lg shadow-night-950/10 hover:-translate-y-0.5 hover:bg-sand-50",
  "outline-light":
    "border border-white/30 bg-white/5 text-white backdrop-blur-md hover:border-white/60 hover:bg-white/15",
  "outline-dark": "border border-night-950/15 text-night-950 hover:border-night-950/40 hover:bg-night-950/5",
  "ghost-light": "text-white/85 hover:bg-white/10 hover:text-white",
};

const sizes: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-13 px-7 text-base",
};

interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function buttonStyles({ variant = "primary", size = "md" }: ButtonStyleProps = {}) {
  return cn(base, variants[variant], sizes[size]);
}

type ButtonProps = ComponentProps<"button"> & ButtonStyleProps;

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & ButtonStyleProps;

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}
