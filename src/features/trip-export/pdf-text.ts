/**
 * Les polices standard des PDF (Helvetica) utilisent l'encodage WinAnsi :
 * les accents français, « », €, œ… sont disponibles, mais pas les emojis,
 * ≈, →, ✓ ni les espaces fines insécables produites par Intl.
 * On adapte donc chaque texte avant de le dessiner.
 */

/** Espace insécable (présente dans WinAnsi) : les montants « 1 560 € » ne sont jamais coupés. */
export const NBSP = "\u00a0";

const WIN_ANSI_EXTRAS = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ");

const isWinAnsi = (char: string) => {
  const code = char.codePointAt(0)!;
  return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_EXTRAS.has(char);
};

const REPLACEMENTS: [RegExp, string][] = [
  [/[\u202f\u2007\u2009\u00a0]/g, NBSP],
  [/≈\s?/g, `env.${NBSP}`],
  [/[→⇒]/g, "–"],
  [/[✓✔✅]/g, ""],
  [/\t|\r?\n/g, " "],
];

export function pdfSafe(text: string): string {
  let result = text.normalize("NFC");
  for (const [pattern, replacement] of REPLACEMENTS) result = result.replace(pattern, replacement);
  return [...result]
    .filter(isWinAnsi)
    .join("")
    .replace(/ {2,}/g, " ")
    .replace(/^[ \u00a0]+|[ \u00a0]+$/g, "");
}
