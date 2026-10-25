/** Chargement du catalogue : squelette à la géométrie des cartes (pas d'animation clignotante). */
export default function Loading() {
  return (
    <div className="shell pt-[calc(var(--header-h)+5rem)] pb-24" aria-busy="true" aria-label="Chargement du catalogue">
      <div className="h-4 w-40 bg-graphite" />
      <div className="mt-8 h-24 w-3/4 max-w-2xl bg-graphite/70" />
      <div className="mt-16 h-14 w-full bg-abyss" />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index} className="border hairline bg-abyss">
            <div className="aspect-[16/10] border-b hairline bg-void" />
            <div className="grid gap-3 p-6">
              <div className="h-3 w-1/2 bg-graphite" />
              <div className="h-5 w-4/5 bg-graphite" />
              <div className="h-3 w-full bg-graphite/60" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
