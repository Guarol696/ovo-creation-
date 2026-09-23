import { BookOpen, FileDown } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PLANS } from "@/config/premium";
import { PremiumFeature } from "@/features/premium/components/premium-feature";
import { tripPdfUrl, type PdfSource } from "@/features/trip-export/pdf-url";
import { cn } from "@/lib/utils";

const INCLUDED = [
  "Tout le voyage : programme, carte des étapes, budget",
  "Toutes les alternatives de transport et d'hébergement",
  "Une checklist de départ adaptée à ta destination",
  "Des pages de notes pour tes adresses et souvenirs",
];

/** 📘 Carnet de voyage PDF (fonctionnalité Premium déclarée dans config/premium.ts). */
export function TravelBookSection({ source }: { source: PdfSource }) {
  return (
    <section aria-label="Carnet de voyage" className="pt-4 pb-2">
      <Container>
        <PremiumFeature feature="pdf_travel_book">
          <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-gold-400/15 via-night-900 to-night-900 p-5 ring-1 ring-gold-400/40 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-bold tracking-[0.15em] text-gold-300 uppercase">
                Inclus dans ton offre · dès {PLANS.medium.name}
              </p>
            </div>
            <h2 className="mt-4 flex items-center gap-2 font-display text-2xl font-bold sm:text-3xl">
              <BookOpen className="size-6 text-gold-300" aria-hidden="true" /> Ton carnet de voyage
            </h2>
            <ul className="mt-4 grid gap-2 text-sm text-night-100/85 sm:grid-cols-2">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-gold-300">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={tripPdfUrl(source, "carnet")}
              download
              className={cn(buttonStyles({ size: "lg" }), "mt-6 w-full sm:w-auto")}
            >
              <FileDown className="size-5" /> Télécharger mon carnet (PDF)
            </a>
          </div>
        </PremiumFeature>
      </Container>
    </section>
  );
}
