import { Fragment, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealLinesProps {
  /** Une entrée par ligne : la composition des lignes est une décision de design. */
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  /** Délai avant la première ligne, en ms. */
  delay?: number;
  lang?: string;
  /** Texte lu par les lecteurs d'écran (sinon : le contenu des lignes). */
  label?: string;
  id?: string;
}

/** Révélation ligne par ligne par masque (une balise par ligne, pas par caractère). */
export function RevealLines({ lines, as: Tag = "h2", className, lineClassName, delay = 0, lang, label, id }: RevealLinesProps) {
  return (
    <Tag
      id={id}
      data-reveal="lines"
      className={className}
      style={{ "--d": `${delay}ms` } as CSSProperties}
      lang={lang}
      aria-label={label}
    >
      {lines.map((line, index) => (
        <span key={index} className={cn("line-mask", lineClassName)} aria-hidden={label ? true : undefined}>
          <span className="line-inner" style={{ "--i": index } as CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

interface RevealWordsProps {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  lang?: string;
}

/** Apparition progressive des mots (un nœud par mot). */
export function RevealWords({ text, as: Tag = "p", className, delay = 0, lang }: RevealWordsProps) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <Tag data-reveal="words" className={className} style={{ "--d": `${delay}ms` } as CSSProperties} lang={lang}>
      {words.map((word, index) => (
        <Fragment key={index}>
          <span className="word" style={{ "--i": index } as CSSProperties}>
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
