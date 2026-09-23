import { Experience } from "@/features/landing/experience";
import { FinalCta } from "@/features/landing/final-cta";
import { Hero } from "@/features/landing/hero";
import { HowItWorks } from "@/features/landing/how-it-works";
import { Inspiration } from "@/features/landing/inspiration";
import { PremiumTeaser } from "@/features/landing/premium-teaser";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Inspiration />
      <Experience />
      <PremiumTeaser />
      <FinalCta />
    </>
  );
}
