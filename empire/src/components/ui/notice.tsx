import { Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Message d'état : mode démo, configuration manquante, erreur. */
export function Notice({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: "info" | "demo" | "error";
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  const Icon = tone === "error" ? TriangleAlert : Info;
  return (
    <div
      role={tone === "error" ? "alert" : "note"}
      className={cn(
        "flex gap-3 border p-4 text-sm",
        tone === "info" && "hairline bg-abyss text-silver",
        tone === "demo" && "border-volt/30 bg-volt/[0.04] text-silver",
        tone === "error" && "border-danger/40 bg-danger/[0.06] text-paper",
        className,
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", tone === "demo" ? "text-volt" : tone === "error" ? "text-danger" : "text-mist")} />
      <div className="grid min-w-0 gap-1 [overflow-wrap:anywhere]">
        <p className="font-medium text-paper">{title}</p>
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
