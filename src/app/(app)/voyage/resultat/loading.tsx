import { Container } from "@/components/ui/container";
import { GenerationScreen } from "@/features/trip-builder/components/generation-screen";

/** Affiché pendant la génération côté serveur (ex. lien ouvert directement). */
export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col bg-night-950 pt-24 text-white sm:pt-32">
      <Container className="max-w-3xl">
        <GenerationScreen />
      </Container>
    </div>
  );
}
