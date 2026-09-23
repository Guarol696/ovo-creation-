import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = { title: "À propos" };

export default function AboutPage() {
  return (
    <ComingSoon
      eyebrow="À propos"
      title="OVO, pour « Où On Va »"
      description="On croit que partir devrait être simple, même avec un petit budget. OVO t'aide à trouver le voyage qui te ressemble, sans passer des heures à comparer."
    />
  );
}
