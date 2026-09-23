import Link from "next/link";
import { routes, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export function Logo({ className, onClick }: LogoProps) {
  return (
    <Link
      href={routes.home}
      onClick={onClick}
      aria-label={`${siteConfig.name} — ${siteConfig.meaning}, accueil`}
      className={cn("group inline-flex items-center gap-2 text-white", className)}
    >
      <span className="relative grid size-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15 backdrop-blur-md transition-transform duration-500 group-hover:rotate-[20deg]">
        <span className="size-4.5 rounded-full border-[3.5px] border-sun-400" />
        <span className="absolute size-1.5 rounded-full bg-sun-500" />
      </span>
      <span className="font-display text-2xl font-extrabold tracking-tight">OVO</span>
    </Link>
  );
}
