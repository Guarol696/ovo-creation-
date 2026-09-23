import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { pdfSafe } from "./pdf-text";

/**
 * Petit moteur de mise en page au-dessus de pdf-lib : curseur vertical,
 * retour à la ligne, sauts de page, cartes arrondies, en-tête et pied de page.
 */

const hex = (value: string): RGB => {
  const n = Number.parseInt(value.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

/** Palette OVO (voir src/app/globals.css). */
export const COLORS = {
  night950: hex("#060c1f"),
  night900: hex("#0b1530"),
  night800: hex("#111e42"),
  night700: hex("#182a59"),
  night400: hex("#4f68a8"),
  night300: hex("#7d93c9"),
  night100: hex("#d6def2"),
  night50: hex("#eef2fb"),
  sun400: hex("#ffab52"),
  sun500: hex("#ff8a2a"),
  sun600: hex("#f06c0f"),
  gold300: hex("#f3d68f"),
  gold500: hex("#d4a441"),
  sand50: hex("#fbf8f3"),
  sand100: hex("#f4eee4"),
  white: rgb(1, 1, 1),
  text: hex("#111e42"),
  muted: hex("#5b6b91"),
  line: hex("#e3e8f4"),
};

/** A4 en points. */
export const PAGE = { width: 595.28, height: 841.89, margin: 48, top: 88, bottom: 64 };

export interface TextStyle {
  size?: number;
  font?: "regular" | "bold" | "italic";
  color?: RGB;
  lineHeight?: number;
  /** Décalage horizontal depuis la marge gauche. */
  indent?: number;
  maxWidth?: number;
  align?: "left" | "right";
}

export class PdfWriter {
  readonly doc: PDFDocument;
  readonly fonts: Record<"regular" | "bold" | "italic", PDFFont>;
  page!: PDFPage;
  /** Position verticale du curseur (origine en bas de page, comme en PDF). */
  y = 0;
  readonly contentWidth = PAGE.width - PAGE.margin * 2;

  private constructor(doc: PDFDocument, fonts: PdfWriter["fonts"]) {
    this.doc = doc;
    this.fonts = fonts;
  }

  static async create() {
    const doc = await PDFDocument.create();
    const [regular, bold, italic] = await Promise.all([
      doc.embedFont(StandardFonts.Helvetica),
      doc.embedFont(StandardFonts.HelveticaBold),
      doc.embedFont(StandardFonts.HelveticaOblique),
    ]);
    return new PdfWriter(doc, { regular, bold, italic });
  }

  addPage() {
    this.page = this.doc.addPage([PAGE.width, PAGE.height]);
    this.y = PAGE.height - PAGE.top;
    return this.page;
  }

  /** Nouvelle page si la hauteur demandée ne tient plus. */
  ensure(height: number) {
    if (this.y - height < PAGE.bottom) this.addPage();
  }

  space(points: number) {
    this.y -= points;
  }

  width(text: string, size: number, font: keyof PdfWriter["fonts"] = "regular") {
    return this.fonts[font].widthOfTextAtSize(pdfSafe(text), size);
  }

  /** Découpe un texte en lignes tenant dans `maxWidth`. */
  wrap(text: string, size: number, font: keyof PdfWriter["fonts"], maxWidth: number): string[] {
    const f = this.fonts[font];
    const lines: string[] = [];
    let line = "";
    for (const word of pdfSafe(text).split(" ")) {
      if (!word) continue;
      const candidate = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      // Mot plus long que la ligne : coupé en morceaux.
      let rest = word;
      while (f.widthOfTextAtSize(rest, size) > maxWidth && rest.length > 1) {
        let cut = rest.length - 1;
        while (cut > 1 && f.widthOfTextAtSize(rest.slice(0, cut), size) > maxWidth) cut--;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
      line = rest;
    }
    if (line) lines.push(line);
    return lines;
  }

  /** Hauteur qu'occuperait un texte. */
  measure(text: string, style: TextStyle = {}) {
    const size = style.size ?? 10;
    const maxWidth = style.maxWidth ?? this.contentWidth - (style.indent ?? 0);
    const lines = this.wrap(text, size, style.font ?? "regular", maxWidth).length;
    return lines * size * (style.lineHeight ?? 1.4);
  }

  /** Dessine un texte au curseur (avec retour à la ligne et saut de page). */
  text(text: string, style: TextStyle = {}) {
    const size = style.size ?? 10;
    const fontKey = style.font ?? "regular";
    const indent = style.indent ?? 0;
    const maxWidth = style.maxWidth ?? this.contentWidth - indent;
    const leading = size * (style.lineHeight ?? 1.4);
    for (const line of this.wrap(text, size, fontKey, maxWidth)) {
      this.ensure(leading);
      const lineWidth = this.fonts[fontKey].widthOfTextAtSize(line, size);
      const x = PAGE.margin + indent + (style.align === "right" ? maxWidth - lineWidth : 0);
      this.page.drawText(line, {
        x,
        y: this.y - size,
        size,
        font: this.fonts[fontKey],
        color: style.color ?? COLORS.text,
      });
      this.y -= leading;
    }
  }

  /** Texte à une position absolue (sans déplacer le curseur). */
  textAt(text: string, x: number, y: number, style: Omit<TextStyle, "indent" | "lineHeight"> = {}) {
    const size = style.size ?? 10;
    const fontKey = style.font ?? "regular";
    let safe = pdfSafe(text);
    if (style.maxWidth) {
      const f = this.fonts[fontKey];
      while (safe.length > 1 && f.widthOfTextAtSize(safe, size) > style.maxWidth)
        safe = `${safe.slice(0, -2)}…`;
    }
    const width = this.fonts[fontKey].widthOfTextAtSize(safe, size);
    this.page.drawText(safe, {
      x: style.align === "right" ? x - width : x,
      y,
      size,
      font: this.fonts[fontKey],
      color: style.color ?? COLORS.text,
    });
    return width;
  }

  /** Rectangle arrondi ; `top` = bord supérieur (coordonnées PDF). */
  roundedRect(
    x: number,
    top: number,
    width: number,
    height: number,
    radius: number,
    color: RGB,
    border?: RGB,
  ) {
    const r = Math.min(radius, width / 2, height / 2);
    const path = `M ${r} 0 H ${width - r} Q ${width} 0 ${width} ${r} V ${height - r} Q ${width} ${height} ${width - r} ${height} H ${r} Q 0 ${height} 0 ${height - r} V ${r} Q 0 0 ${r} 0 Z`;
    this.page.drawSvgPath(path, {
      x,
      y: top,
      color,
      borderColor: border,
      borderWidth: border ? 0.75 : 0,
    });
  }

  line(x1: number, y1: number, x2: number, y2: number, color = COLORS.line, thickness = 0.75) {
    this.page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, color, thickness });
  }
}
