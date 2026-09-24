"use client";

import { FileDown } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { useTripPage } from "@/features/trip-results/components/save-trip-button";
import { cn } from "@/lib/utils";

/** 📄 « Télécharger mon voyage » : PDF généré par le serveur (lien de téléchargement direct). */
export function DownloadTripButton({
  className,
  label = "long",
}: {
  className?: string;
  label?: "short" | "long";
}) {
  const { pdfUrl } = useTripPage();
  return (
    <a
      href={pdfUrl}
      download
      className={cn(buttonStyles({ variant: "outline-light", size: "lg" }), className)}
      aria-label="Télécharger mon voyage (PDF)"
    >
      <FileDown className="size-5" />
      {label === "short" ? (
        <>
          <span className="sm:hidden">Télécharger</span>
          <span className="hidden sm:inline">Télécharger mon voyage</span>
        </>
      ) : (
        "Télécharger mon voyage"
      )}
      <span className="hidden rounded-md bg-white/10 px-1.5 py-0.5 text-xs font-bold tracking-wide min-[400px]:inline">
        PDF
      </span>
    </a>
  );
}
