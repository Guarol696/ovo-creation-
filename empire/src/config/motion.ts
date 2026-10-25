/**
 * Système de mouvement EMPIRE — source unique des durées et courbes.
 * Les mêmes valeurs existent en variables CSS dans `globals.css`
 * (un test vérifie qu'elles restent synchronisées).
 *
 * Règles :
 *  - on n'anime que `transform`, `opacity`, `clip-path` (et `filter` ponctuellement) ;
 *  - toute animation a un état final lisible si JavaScript ou l'animation est désactivé ;
 *  - en mouvement réduit, les durées tombent à ~0 et les déplacements disparaissent.
 */
export const duration = {
  /** Retour immédiat : survol, pression. */
  instant: 120,
  /** Micro-interactions d'interface. */
  quick: 240,
  /** Apparition d'éléments, menus. */
  base: 420,
  /** Révélations typographiques. */
  slow: 800,
  /** Scènes d'ouverture, transitions signature. */
  cinematic: 1400,
} as const;

export const ease = {
  /** Décélération longue : entrées, révélations. */
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** Accélération + décélération marquées : transitions de page. */
  inOut: "cubic-bezier(0.76, 0, 0.24, 1)",
  /** Accélération : sorties. */
  in: "cubic-bezier(0.7, 0, 0.84, 0)",
  /** Léger rebond physique : validation, magnétisme. */
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

/** Équivalents GSAP des courbes ci-dessus. */
export const gsapEase = {
  out: "expo.out",
  inOut: "power4.inOut",
  in: "power4.in",
} as const;

/** Transitions signature (durées par phase, en ms). */
export const transitions = {
  portal: { cover: 520, reveal: 620 },
  zoom: { cover: 560, reveal: 640 },
  /** Au-delà, on révèle quand même la page (navigation lente). */
  safetyTimeout: 8000,
} as const;

export const stagger = {
  line: 90,
  word: 35,
} as const;
