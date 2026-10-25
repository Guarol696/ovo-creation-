import type { ProjectExample } from "@/data/projects";

/** Plans filaires des projets réalisables : un dessin technique par type de projet. */
const line = { stroke: "var(--color-silver)", fill: "none", strokeOpacity: 0.7, vectorEffect: "non-scaling-stroke" as const };
const faint = { ...line, strokeOpacity: 0.25 };
const volt = { stroke: "var(--color-volt)", fill: "none", vectorEffect: "non-scaling-stroke" as const };

function Site() {
  return (
    <>
      <rect x="40" y="30" width="320" height="240" {...line} />
      <path d="M40 54H360" {...faint} />
      <circle cx="54" cy="42" r="3" {...faint} />
      <circle cx="66" cy="42" r="3" {...faint} />
      <path d="M64 86H250M64 104H210" {...line} strokeWidth={2} />
      <path d="M64 124H230M64 136H200" {...faint} />
      <rect x="64" y="154" width="86" height="26" {...volt} />
      <rect x="262" y="78" width="74" height="104" {...faint} />
      <path d="M64 206H136M156 206H228M248 206H336" {...faint} />
      <path d="M64 222H124M156 222H212M248 222H320" {...faint} />
    </>
  );
}

function Shop() {
  return (
    <>
      <rect x="40" y="30" width="320" height="240" {...line} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={60 + i * 100} y="60" width="80" height="90" {...faint} />
          <path d={`M${60 + i * 100} 164H${120 + i * 100}`} {...line} />
          <path d={`M${60 + i * 100} 176H${100 + i * 100}`} {...faint} />
          <rect x={60 + i * 100} y="190" width="44" height="18" {...(i === 1 ? volt : faint)} />
        </g>
      ))}
      <path d="M318 40l8 0 6 16h18" {...line} />
    </>
  );
}

function App() {
  return (
    <>
      <rect x="140" y="20" width="120" height="260" rx="18" {...line} />
      <path d="M182 34H218" {...faint} />
      <path d="M158 70H242M158 84H220" {...line} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="158" y={106 + i * 34} width="84" height="26" {...(i === 1 ? volt : faint)} />
        </g>
      ))}
      <path d="M150 256H250" {...faint} />
      <path d="M60 120H120M280 160H340" {...faint} strokeDasharray="3 5" />
      <rect x="40" y="100" width="20" height="40" {...faint} />
      <rect x="340" y="140" width="20" height="40" {...faint} />
    </>
  );
}

function Brand() {
  return (
    <>
      <circle cx="200" cy="150" r="96" {...line} />
      <circle cx="200" cy="150" r="64" {...faint} />
      <path d="M152 186L200 98L248 186" {...line} strokeWidth={2} />
      <path d="M170 156H230" {...volt} strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={70 + i * 56} y="262" width="40" height="14" {...faint} fill={i === 0 ? "var(--color-paper)" : i === 4 ? "var(--color-volt)" : "none"} />
      ))}
    </>
  );
}

function Product() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={110 + i * 18} y={50 + i * 14} width="160" height="200" {...(i === 2 ? line : faint)} />
      ))}
      <path d="M164 120H274M164 136H250M164 152H262" {...faint} />
      <path d="M164 92H240" {...line} strokeWidth={2} />
      <rect x="164" y="210" width="60" height="20" {...volt} />
    </>
  );
}

function Venture() {
  return (
    <>
      <rect x="40" y="40" width="320" height="220" {...faint} />
      <path d="M140 40V260M260 40V260M40 150H360" {...faint} />
      <path d="M60 240 L130 200 L190 214 L250 150 L330 80" {...line} strokeWidth={1.5} />
      <circle cx="330" cy="80" r="6" {...volt} />
      <path d="M60 70H110M160 70H230M280 70H340" {...line} />
      <path d="M60 86H96M160 86H210M280 86H320" {...faint} />
    </>
  );
}

const drawings: Record<ProjectExample["slug"], () => React.JSX.Element> = {
  site: Site,
  boutique: Shop,
  application: App,
  marque: Brand,
  produit: Product,
  entreprise: Venture,
};

export function Blueprint({ kind, className }: { kind: ProjectExample["slug"]; className?: string }) {
  const Drawing = drawings[kind];
  return (
    <svg viewBox="0 0 400 300" className={className} aria-hidden>
      <Drawing />
    </svg>
  );
}
