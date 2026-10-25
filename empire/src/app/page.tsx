import { AcademyPreview } from "@/features/home/academy-preview";
import { BuildReal } from "@/features/home/build-real";
import { FinalCall } from "@/features/home/final-call";
import { Opening } from "@/features/home/opening";
import { PersonalAI } from "@/features/home/personal-ai";
import { Philosophy } from "@/features/home/philosophy";
import { Pillars } from "@/features/home/pillars";
import { isAssistantConfigured } from "@/features/assistant/config";

export default function HomePage() {
  return (
    <>
      <Opening />
      <Philosophy />
      <Pillars />
      <AcademyPreview />
      <BuildReal />
      <PersonalAI assistantEnabled={isAssistantConfigured()} />
      <FinalCall />
    </>
  );
}
