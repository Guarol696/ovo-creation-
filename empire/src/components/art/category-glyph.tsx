import type { CategorySlug } from "@/types/academy";
import { cn } from "@/lib/utils";

/**
 * Glyphes procéduraux des catégories : chaque domaine a sa géométrie,
 * toutes partagent le même langage (traits argent, un seul accent volt).
 * Sans identifiants internes : ils peuvent être clonés par la transition
 * « zoom ». Les animations de survol sont pilotées par le parent `group`.
 */
const stroke = { stroke: "currentColor", fill: "none", vectorEffect: "non-scaling-stroke" as const };
const accent = { stroke: "var(--color-volt)", fill: "none", vectorEffect: "non-scaling-stroke" as const };

function Grid() {
  const lines = [40, 70, 100, 130, 160];
  return (
    <>
      {lines.map((v) => (
        <path key={`h${v}`} d={`M20 ${v}H180`} {...stroke} strokeOpacity={0.35} />
      ))}
      {lines.map((v) => (
        <path key={`v${v}`} d={`M${v} 20V180`} {...stroke} strokeOpacity={0.35} />
      ))}
      <rect x="40" y="40" width="90" height="60" {...stroke} strokeWidth={1.5} className="origin-center transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-[30px]" />
      <rect x="70" y="100" width="90" height="60" {...stroke} strokeWidth={1.5} />
      <rect x="100" y="40" width="30" height="30" {...accent} strokeWidth={1.5} />
    </>
  );
}

function Network() {
  const nodes = [
    [100, 30],
    [40, 80],
    [160, 80],
    [70, 150],
    [130, 150],
    [100, 100],
  ];
  const links = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [5, 0], [5, 1], [5, 2], [5, 3], [5, 4],
  ];
  return (
    <>
      {links.map(([a, b]) => (
        <path key={`${a}-${b}`} d={`M${nodes[a][0]} ${nodes[a][1]}L${nodes[b][0]} ${nodes[b][1]}`} {...stroke} strokeOpacity={0.4} />
      ))}
      {nodes.map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r={index === 5 ? 9 : 5} {...(index === 5 ? accent : stroke)} strokeWidth={1.5} />
      ))}
      <circle cx="100" cy="100" r="70" {...stroke} strokeOpacity={0.2} strokeDasharray="2 6" className="origin-center transition-transform duration-1000 ease-[var(--ease-out)] group-hover:rotate-90" />
    </>
  );
}

function Pyramid() {
  return (
    <>
      {[0, 1, 2, 3].map((level) => (
        <path
          key={level}
          d={`M${100 - (level + 1) * 20} ${70 + level * 30}H${100 + (level + 1) * 20}`}
          {...stroke}
          strokeOpacity={0.45}
        />
      ))}
      <path d="M100 30L20 170H180Z" {...stroke} strokeWidth={1.5} />
      <path d="M100 30L130 170" {...stroke} strokeOpacity={0.35} />
      <path d="M100 30L112 52L88 52Z" {...accent} strokeWidth={1.5} className="transition-transform duration-700 ease-[var(--ease-out)] group-hover:-translate-y-2" />
    </>
  );
}

function Modules() {
  const cells = [
    [30, 30, 60, 60],
    [100, 30, 70, 30],
    [100, 70, 30, 20],
    [140, 70, 30, 60],
    [30, 100, 100, 70],
    [140, 140, 30, 30],
  ];
  return (
    <>
      {cells.map(([x, y, w, h], index) => (
        <rect key={index} x={x} y={y} width={w} height={h} {...(index === 2 ? accent : stroke)} strokeWidth={1.5} strokeOpacity={index === 4 ? 0.5 : 1} />
      ))}
      <path d="M45 125H115M45 140H95M45 155H105" {...stroke} strokeOpacity={0.35} className="transition-opacity duration-500 group-hover:opacity-0" />
    </>
  );
}

function Orbit() {
  return (
    <>
      <ellipse cx="100" cy="100" rx="80" ry="30" {...stroke} strokeOpacity={0.5} transform="rotate(-20 100 100)" />
      <ellipse cx="100" cy="100" rx="80" ry="30" {...stroke} strokeOpacity={0.3} transform="rotate(40 100 100)" />
      <circle cx="100" cy="100" r="26" {...stroke} strokeWidth={1.5} />
      <path d="M86 92h28l-4 18H90z" {...stroke} />
      <g className="origin-center transition-transform duration-1000 ease-[var(--ease-out)] group-hover:rotate-[160deg]">
        <circle cx="175" cy="73" r="6" {...accent} strokeWidth={1.5} />
      </g>
    </>
  );
}

function Wave() {
  const waves = [0, 1, 2, 3, 4];
  return (
    <>
      {waves.map((index) => (
        <path
          key={index}
          d={`M20 ${60 + index * 20} C 60 ${30 + index * 20}, 80 ${90 + index * 20}, 100 ${60 + index * 20} S 160 ${30 + index * 20}, 180 ${60 + index * 20}`}
          {...(index === 2 ? accent : stroke)}
          strokeOpacity={index === 2 ? 1 : 0.25 + index * 0.1}
          strokeWidth={index === 2 ? 1.5 : 1}
        />
      ))}
      <path d="M100 20V180" {...stroke} strokeOpacity={0.2} strokeDasharray="3 5" className="transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-10" />
    </>
  );
}

function Trajectory() {
  return (
    <>
      <path d="M20 170H180M20 170V20" {...stroke} strokeOpacity={0.3} />
      {[50, 80, 110, 140].map((x) => (
        <path key={x} d={`M${x} 170V165`} {...stroke} strokeOpacity={0.5} />
      ))}
      <path d="M25 160 C 70 155, 90 120, 110 95 S 150 40, 175 30" {...stroke} strokeWidth={1.5} />
      <circle cx="110" cy="95" r="4" {...stroke} />
      <path d="M160 26L178 29L170 45" {...accent} strokeWidth={1.5} className="transition-transform duration-700 ease-[var(--ease-out)] group-hover:translate-x-1 group-hover:-translate-y-1" />
    </>
  );
}

const glyphs: Record<CategorySlug, () => React.JSX.Element> = {
  "sites-web": Grid,
  "intelligence-artificielle": Network,
  entrepreneuriat: Pyramid,
  applications: Modules,
  "e-commerce": Orbit,
  marketing: Wave,
  freelancing: Trajectory,
};

export function CategoryGlyph({ category, className }: { category: CategorySlug; className?: string }) {
  const Glyph = glyphs[category];
  return (
    <svg viewBox="0 0 200 200" className={cn("text-silver", className)} aria-hidden>
      <Glyph />
    </svg>
  );
}
