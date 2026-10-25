import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { Magnetic } from "@/components/motion/magnetic";
import { TransitionLink } from "@/components/motion/transition-link";
import type { TransitionKind } from "@/components/motion/transition-provider";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

/**
 * Bouton EMPIRE : arêtes vives, libellé monospace, remplissage qui monte
 * au survol (inversion noir/blanc). Hauteur ≥ 48 px (cible tactile).
 */
export function buttonStyles(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "group/btn relative isolate inline-flex items-center justify-center gap-3 overflow-hidden meta font-medium select-none",
    "transition-[color,border-color,opacity] duration-[var(--dur-quick)] ease-[var(--ease-out)]",
    "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
    "active:scale-[0.98]",
    size === "lg" ? "min-h-14 px-7 text-[0.8125rem]" : "min-h-12 px-5",
    variant === "primary" &&
      "bg-paper text-void before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-volt before:transition-transform before:duration-[var(--dur-base)] before:ease-[var(--ease-out)] hover:before:scale-y-100",
    variant === "outline" &&
      "border hairline text-paper before:absolute before:inset-0 before:-z-10 before:origin-bottom before:scale-y-0 before:bg-paper before:transition-transform before:duration-[var(--dur-base)] before:ease-[var(--ease-out)] hover:text-void hover:before:scale-y-100",
    variant === "ghost" && "px-0 text-paper hover:text-volt",
    className,
  );
}

const Arrow = () => (
  <ArrowUpRight
    aria-hidden
    className="size-4 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
  />
);

interface CommonProps {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  magnetic?: boolean;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant,
  size,
  arrow,
  magnetic,
  className,
  children,
  type = "button",
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  const button = (
    <button type={type} className={buttonStyles(variant, size, className)} {...props}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </button>
  );
  return magnetic ? <Magnetic>{button}</Magnetic> : button;
}

type ButtonLinkProps = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & {
    href: string;
    transition?: TransitionKind;
    transitionLabel?: string;
  };

export function ButtonLink({
  variant,
  size,
  arrow = true,
  magnetic,
  className,
  children,
  transition,
  transitionLabel,
  ...props
}: ButtonLinkProps) {
  const content = (
    <>
      <span>{children}</span>
      {arrow && <Arrow />}
    </>
  );
  const link = transition ? (
    <TransitionLink
      transition={transition}
      transitionLabel={transitionLabel}
      className={buttonStyles(variant, size, className)}
      {...props}
    >
      {content}
    </TransitionLink>
  ) : (
    <Link className={buttonStyles(variant, size, className)} {...props}>
      {content}
    </Link>
  );
  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}
