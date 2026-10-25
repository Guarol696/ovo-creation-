import { RevealLines } from "@/components/motion/reveal-text";
import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/config/site";

/** Scène 7 — Final call : l'anneau du début revient, cette fois comme une porte. */
export function FinalCall() {
  return (
    <section aria-labelledby="final-title" className="relative isolate overflow-hidden border-t hairline py-32 md:py-48">
      <div aria-hidden className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="size-[140vmin] rounded-full border hairline" />
        <div className="absolute size-[100vmin] animate-[spin-slow_80s_linear_infinite] rounded-full border border-silver/10 [border-top-color:var(--color-silver)]" />
        <div className="absolute size-[64vmin] animate-[spin-slow_50s_linear_infinite_reverse] rounded-full border border-silver/10 [border-left-color:var(--color-volt)]" />
        <div className="absolute inset-0 bg-[radial-gradient(closest-side,transparent_40%,var(--color-void)_100%)]" />
      </div>

      <div className="shell flex flex-col items-center text-center">
        <p className="meta text-mist">[ 007 ] Final call</p>
        <RevealLines
          id="final-title"
          lang="en"
          className="font-expanded display-lg mt-10"
          lines={["Your idea", "deserves", <span key="e">to exist<span className="text-volt">.</span></span>]}
          label="Your idea deserves to exist."
        />
        <p data-reveal="up" lang="en" className="mt-8 max-w-md text-lg text-silver">
          Everything you need to learn, create and launch.
        </p>
        <div data-reveal="up" className="mt-12">
          <ButtonLink href={routes.signup} size="lg" magnetic transition="portal" transitionLabel="Begin" data-cursor-label="Start">
            Start your journey
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
