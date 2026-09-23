import type { Metadata } from "next";
import { ComingSoon } from "@/components/sections/coming-soon";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <ComingSoon
      eyebrow="Contact"
      title="On t'écoute."
      description="Une question, une idée, un partenariat ? Le formulaire de contact arrive très bientôt."
    />
  );
}
