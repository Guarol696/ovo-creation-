import type { RGB } from "pdf-lib";
import { ACCOMMODATION_LABELS } from "@/features/trip-engine/services/accommodation";
import { ACTIVITY_THEMES } from "@/features/trip-engine/services/activities";
import { RESTAURANT_KINDS } from "@/features/trip-engine/services/restaurants";
import { LOCAL_MOBILITY_LABELS, TRANSPORT_LABELS } from "@/features/trip-engine/services/transport";
import { formatDateFr } from "@/lib/dates";
import { formatDates, formatTravelers } from "@/lib/trip/format";
import { formatPrice } from "@/lib/utils";
import type {
  BudgetCategory,
  DayPeriod,
  ItineraryDay,
  ItinerarySlot,
  PlanActivity,
  PlanRestaurant,
  TravelLeg,
  TravelPlan,
} from "@/types/travel-plan";
import { NBSP, pdfSafe } from "./pdf-text";
import { COLORS, PAGE, PdfWriter, type TextStyle } from "./pdf-writer";

/**
 * Export PDF d'un voyage (A4, imprimable, lisible sur téléphone).
 * Couverture → résumé → transport → hébergement → programme jour par jour
 * → activités → restaurants → budget. Pied de page paginé sur chaque page.
 */

export interface TripPdfOptions {
  generatedAt?: Date;
}

const PERIOD_LABELS: Record<DayPeriod, string> = {
  morning: "Matin",
  lunch: "Midi",
  afternoon: "Après-midi",
  evening: "Soir",
  night: "Nuit",
};

const BUDGET_ROWS: { id: BudgetCategory; label: string }[] = [
  { id: "transport", label: "Transport" },
  { id: "accommodation", label: "Hébergement" },
  { id: "food", label: "Nourriture" },
  { id: "activities", label: "Activités" },
  { id: "other", label: "Autres" },
];

const LEG_LABELS: Record<TravelLeg["mode"], string> = {
  walk: "à pied",
  transit: "en transports",
  road: "de route",
};

const MAX_ACTIVITIES = 14;
const MAX_RESTAURANTS = 10;

const longDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const price = (amount: number) => formatPrice(amount).replace(/[\u202f\u00a0]/g, NBSP);
const approx = (amount: number) => (amount === 0 ? "Gratuit" : `env.${NBSP}${price(amount)}`);
const plural = (n: number, word: string) => `${n}${NBSP}${word}${n > 1 ? "s" : ""}`;

export async function buildTripPdf(plan: TravelPlan, options: TripPdfOptions = {}): Promise<Uint8Array> {
  const generatedAt = options.generatedAt ?? new Date();
  const w = await PdfWriter.create();
  const title = `Mon voyage à ${plan.destination.name}`;

  w.doc.setTitle(`${title} — OVO`);
  w.doc.setAuthor("OVO — Où On Va ?");
  w.doc.setSubject("Voyage imaginé avec OVO (données de démonstration, prix indicatifs)");
  w.doc.setCreator("OVO");
  w.doc.setProducer("OVO");
  w.doc.setLanguage("fr-FR");
  w.doc.setCreationDate(generatedAt);
  w.doc.setModificationDate(generatedAt);

  drawCover(w, plan, generatedAt);

  w.addPage();
  drawSummary(w, plan);
  drawTransport(w, plan);
  drawAccommodation(w, plan);
  drawProgramme(w, plan);
  drawActivities(w, plan);
  drawRestaurants(w, plan);
  drawBudget(w, plan);

  drawHeadersAndFooters(w, plan, generatedAt);
  return w.doc.save();
}

// --- Couverture ------------------------------------------------------------------

function drawCover(w: PdfWriter, plan: TravelPlan, generatedAt: Date) {
  const page = w.addPage();
  const { width, height, margin } = PAGE;
  page.drawRectangle({ x: 0, y: 0, width, height, color: COLORS.night950 });
  page.drawCircle({ x: width - 40, y: height - 60, size: 230, color: COLORS.sun500, opacity: 0.16 });
  page.drawCircle({ x: 40, y: 120, size: 260, color: COLORS.night700, opacity: 0.55 });

  drawLogo(w, margin, height - 70, 1.4, COLORS.white);
  w.textAt("Où On Va ?", width - margin, height - 76, { size: 10, color: COLORS.night100, align: "right" });

  let y = height * 0.62;
  w.textAt("TON VOYAGE OVO", margin, y, { size: 10, font: "bold", color: COLORS.gold300 });
  y -= 44;
  w.textAt("Mon voyage à", margin, y, { size: 30, font: "bold", color: COLORS.white });
  for (const line of w.wrap(plan.destination.name, 48, "bold", w.contentWidth)) {
    y -= 52;
    w.textAt(line, margin, y, { size: 48, font: "bold", color: COLORS.sun400 });
  }
  const subtitle = [plan.destination.country, plan.destination.tagline].filter(Boolean).join(" · ");
  y -= 14;
  for (const line of w.wrap(subtitle, 13, "regular", w.contentWidth)) {
    y -= 18;
    w.textAt(line, margin, y, { size: 13, color: COLORS.night100 });
  }

  // Chiffres clés en 2 × 2 cartes.
  const facts: [string, string][] = [
    ["Dates", formatDates(plan.request)],
    ["Durée", `${plural(plan.duration.days, "jour")} · ${plural(plan.duration.nights, "nuit")}`],
    ["Voyageurs", formatTravelers(plan.request)],
    [
      "Budget estimé",
      `${approx(plan.estimatedBudget.total)}${plan.travelers.total > 1 ? ` · ${price(plan.estimatedBudget.perPerson)} / pers.` : ""}`,
    ],
  ];
  const gap = 12;
  const cardW = (w.contentWidth - gap) / 2;
  const cardH = 62;
  let top = y - 36;
  facts.forEach(([label, value], index) => {
    const x = margin + (index % 2) * (cardW + gap);
    if (index === 2) top -= cardH + gap;
    w.roundedRect(x, top, cardW, cardH, 12, COLORS.night800, COLORS.night700);
    w.textAt(label.toUpperCase(), x + 14, top - 20, { size: 8.5, font: "bold", color: COLORS.gold300 });
    w.wrap(value, 11, "bold", cardW - 28)
      .slice(0, 2)
      .forEach((line, i) =>
        w.textAt(line, x + 14, top - 36 - i * 13, { size: 11, font: "bold", color: COLORS.white }),
      );
  });

  w.textAt(
    "Prix indicatifs et établissements de démonstration — aucune réservation n'est effectuée.",
    margin,
    72,
    { size: 9, color: COLORS.night300, maxWidth: w.contentWidth },
  );
  w.textAt(`Généré le ${longDate.format(generatedAt)} avec OVO`, margin, 56, {
    size: 9,
    color: COLORS.night300,
  });
}

function drawLogo(w: PdfWriter, x: number, y: number, scale: number, textColor: RGB) {
  w.page.drawCircle({
    x: x + 8 * scale,
    y: y + 5 * scale,
    size: 7 * scale,
    borderColor: COLORS.sun400,
    borderWidth: 2.4 * scale,
  });
  w.page.drawCircle({ x: x + 8 * scale, y: y + 5 * scale, size: 2.2 * scale, color: COLORS.sun400 });
  w.textAt("OVO", x + 20 * scale, y, { size: 12 * scale, font: "bold", color: textColor });
}

// --- Éléments de mise en page ------------------------------------------------------

/** Titre de section (gardé avec au moins `keepWith` points de contenu). */
function sectionTitle(w: PdfWriter, title: string, subtitle?: string, keepWith = 90) {
  w.ensure(40 + (subtitle ? 16 : 0) + keepWith);
  if (w.y < PAGE.height - PAGE.top - 1) w.space(18);
  w.page.drawRectangle({ x: PAGE.margin, y: w.y - 19, width: 4, height: 19, color: COLORS.sun500 });
  w.textAt(title, PAGE.margin + 12, w.y - 16, { size: 17, font: "bold", color: COLORS.night950 });
  w.space(28);
  if (subtitle) w.text(subtitle, { size: 9.5, color: COLORS.muted });
  w.space(6);
}

/** Texte multi-ligne à une position libre ; renvoie la hauteur utilisée. */
function wrappedAt(
  w: PdfWriter,
  text: string,
  x: number,
  top: number,
  maxWidth: number,
  style: Pick<TextStyle, "size" | "font" | "color" | "lineHeight">,
) {
  const size = style.size ?? 10;
  const leading = size * (style.lineHeight ?? 1.35);
  const lines = w.wrap(text, size, style.font ?? "regular", maxWidth);
  lines.forEach((line, i) =>
    w.textAt(line, x, top - size - i * leading, { size, font: style.font, color: style.color }),
  );
  return lines.length * leading;
}

function wrappedHeight(
  w: PdfWriter,
  text: string,
  maxWidth: number,
  size: number,
  font: "regular" | "bold" | "italic" = "regular",
  lineHeight = 1.35,
) {
  return w.wrap(text, size, font, maxWidth).length * size * lineHeight;
}

/** Carte « libellé : valeur » (transport, hébergement). */
const CARD_PAD = 16;
const CARD_LABEL_W = 104;

function infoCardLayout(w: PdfWriter, rows: [string, string][], note?: string) {
  const valueW = w.contentWidth - CARD_PAD * 2 - CARD_LABEL_W;
  const rowHeights = rows.map(([, value]) => Math.max(14, wrappedHeight(w, value, valueW, 10)) + 6);
  const noteH = note ? wrappedHeight(w, note, w.contentWidth - CARD_PAD * 2, 8.5, "italic") + 6 : 0;
  const height = CARD_PAD + 20 + rowHeights.reduce((a, b) => a + b, 0) + noteH + CARD_PAD - 4;
  return { valueW, rowHeights, height };
}

/** Titre de section + carte, toujours sur la même page. */
function infoCardSection(
  w: PdfWriter,
  section: { title: string; subtitle: string },
  heading: string,
  rows: [string, string][],
  note?: string,
) {
  const { valueW, rowHeights, height } = infoCardLayout(w, rows, note);
  sectionTitle(w, section.title, section.subtitle, height + 8);
  w.ensure(height + 8);

  const top = w.y;
  w.roundedRect(PAGE.margin, top, w.contentWidth, height, 12, COLORS.sand50, COLORS.line);
  w.textAt(heading, PAGE.margin + CARD_PAD, top - CARD_PAD - 12, {
    size: 12.5,
    font: "bold",
    color: COLORS.night950,
    maxWidth: w.contentWidth - CARD_PAD * 2,
  });
  let y = top - CARD_PAD - 24;
  rows.forEach(([label, value], i) => {
    w.textAt(label.toUpperCase(), PAGE.margin + CARD_PAD, y - 10, {
      size: 7.5,
      font: "bold",
      color: COLORS.sun600,
    });
    wrappedAt(w, value, PAGE.margin + CARD_PAD + CARD_LABEL_W, y + 1, valueW, {
      size: 10,
      color: COLORS.text,
    });
    y -= rowHeights[i]!;
  });
  if (note) {
    wrappedAt(w, note, PAGE.margin + CARD_PAD, y, w.contentWidth - CARD_PAD * 2, {
      size: 8.5,
      font: "italic",
      color: COLORS.muted,
    });
  }
  w.y = top - height - 10;
}

/** Phrases assemblées proprement (« A. B. »). */
const sentences = (...parts: (string | undefined)[]) =>
  parts
    .filter((p): p is string => Boolean(p?.trim()))
    .map((p) => p.trim().replace(/([^.!?…])$/, "$1."))
    .join(" ");

// --- Sections -----------------------------------------------------------------------

function drawSummary(w: PdfWriter, plan: TravelPlan) {
  const { destination } = plan;
  sectionTitle(
    w,
    "Résumé",
    destination.country ? `${destination.name} · ${destination.country}` : destination.name,
  );
  w.text(destination.description, { size: 10.5, lineHeight: 1.5 });
  w.space(6);
  w.text(plan.summary, { size: 10.5, lineHeight: 1.5, color: COLORS.muted });

  if (plan.reasons.length > 0) {
    w.space(10);
    w.text("Pourquoi ce voyage", { size: 11.5, font: "bold" });
    w.space(2);
    for (const reason of plan.reasons) bullet(w, reason);
  }

  if (plan.highlights.length > 0) {
    w.space(10);
    w.ensure(60);
    w.text("Points forts", { size: 11.5, font: "bold" });
    w.space(4);
    const gap = 10;
    const cardW = (w.contentWidth - gap) / 2;
    for (let i = 0; i < plan.highlights.length; i += 2) {
      const pair = plan.highlights.slice(i, i + 2);
      const heights = pair.map(
        (h) =>
          14 +
          wrappedHeight(w, h.title, cardW - 24, 10.5, "bold") +
          wrappedHeight(w, h.description, cardW - 24, 9) +
          10,
      );
      const rowH = Math.max(...heights);
      w.ensure(rowH + gap);
      const top = w.y;
      pair.forEach((h, j) => {
        const x = PAGE.margin + j * (cardW + gap);
        w.roundedRect(x, top, cardW, rowH, 10, COLORS.night50);
        const titleH = wrappedAt(w, h.title, x + 12, top - 10, cardW - 24, {
          size: 10.5,
          font: "bold",
          color: COLORS.night950,
        });
        wrappedAt(w, h.description, x + 12, top - 12 - titleH, cardW - 24, { size: 9, color: COLORS.muted });
      });
      w.y = top - rowH - gap;
    }
  }

  if (plan.warnings.length > 0) {
    w.space(4);
    w.text("À savoir", { size: 11.5, font: "bold" });
    for (const warning of plan.warnings) bullet(w, warning, COLORS.sun600);
  }
}

function bullet(w: PdfWriter, text: string, color: RGB = COLORS.sun500) {
  const height = w.measure(text, { size: 10, indent: 14, lineHeight: 1.45 });
  w.ensure(Math.min(height, 30));
  w.page.drawCircle({ x: PAGE.margin + 4, y: w.y - 6.5, size: 2, color });
  w.text(text, { size: 10, indent: 14, lineHeight: 1.45 });
  w.space(2);
}

function drawTransport(w: PdfWriter, plan: TravelPlan) {
  const { main, alternatives, local } = plan.transport;
  const mode = TRANSPORT_LABELS[main.mode].label;
  const rows: [string, string][] = [
    ["Type", `${mode} · ${main.durationLabel}`],
    ["Départ", main.from],
    ["Destination", main.to],
    [
      "Prix indicatif",
      `${approx(main.estimatedRoundTripPerPerson)} aller-retour / pers.${plan.travelers.total > 1 ? ` · ${approx(main.estimatedRoundTripTotal)} au total` : ""}`,
    ],
  ];
  if (main.highlight || main.details) rows.push(["À noter", sentences(main.highlight, main.details)]);
  if (alternatives.length > 0) {
    rows.push([
      "Autres options",
      alternatives
        .map(
          (a) =>
            `${TRANSPORT_LABELS[a.mode].label} (${a.durationLabel}, ${approx(a.estimatedRoundTripPerPerson)} A/R)`,
        )
        .join(" · "),
    ]);
  }
  if (local.options.length > 0) {
    rows.push([
      "Sur place",
      `${local.options.map((o) => LOCAL_MOBILITY_LABELS[o.mode].label).join(", ")} · ${approx(local.estimatedCostPerDayPerPerson)} / jour / pers.`,
    ]);
  }
  infoCardSection(
    w,
    { title: "Transport", subtitle: "Comment y aller et comment se déplacer sur place." },
    `${mode} : ${main.from} – ${main.to}`,
    rows,
    "Prix indicatifs de démonstration, variables selon la date de réservation.",
  );
}

function drawAccommodation(w: PdfWriter, plan: TravelPlan) {
  const a = plan.accommodation.main;
  infoCardSection(
    w,
    { title: "Hébergement", subtitle: "Où dormir pendant le séjour." },
    a.name,
    [
      ["Nom", a.name],
      ["Type", `${ACCOMMODATION_LABELS[a.type].label} · ${a.capacityLabel}`],
      ["Quartier", `${a.area} — ${a.areaDescription}`],
      ["Séjour", `${plural(a.nights, "nuit")} · ${plural(a.guests, "voyageur")}`],
      ["Prix indicatif", `${approx(a.estimatedPricePerNight)} / nuit · ${approx(a.estimatedTotal)} au total`],
      ["Équipements", a.amenities.join(", ")],
    ],
    `Établissement fictif de démonstration (note ${a.rating.toLocaleString("fr-FR")} / 5 indicative).`,
  );
}

function drawProgramme(w: PdfWriter, plan: TravelPlan) {
  w.addPage();
  sectionTitle(w, "Programme", "Jour par jour, avec des horaires et trajets indicatifs.", 120);
  plan.itinerary.forEach((day) => drawDay(w, day));
}

const LEFT_COL = 86;

function slotLines(slot: ItinerarySlot) {
  const meta: string[] = [];
  if (slot.activity && !slot.activity.fullDay) meta.push(slot.activity.durationLabel);
  const area = slot.activity?.area ?? slot.restaurant?.area;
  if (area) meta.push(area);
  if (slot.estimatedCostPerPerson > 0) meta.push(`${approx(slot.estimatedCostPerPerson)} / pers.`);
  if (slot.legFromPrevious) {
    const leg = slot.legFromPrevious;
    const distance =
      leg.distanceKm < 1
        ? `${Math.round((leg.distanceKm * 1000) / 50) * 50} m`
        : `${leg.distanceKm.toLocaleString("fr-FR")} km`;
    meta.push(`trajet ${distance}, env. ${leg.minutes} min ${LEG_LABELS[leg.mode]}`);
  }
  const time = slot.startTime ? (slot.endTime ? `${slot.startTime} – ${slot.endTime}` : slot.startTime) : "";
  return { time, meta: meta.join(" · ") };
}

function slotHeight(w: PdfWriter, slot: ItinerarySlot) {
  const width = w.contentWidth - LEFT_COL - 12;
  const { meta } = slotLines(slot);
  return (
    8 +
    wrappedHeight(w, slot.title, width, 10.5, "bold") +
    wrappedHeight(w, slot.description, width, 9.5) +
    (meta ? wrappedHeight(w, meta, width, 8.5) + 2 : 0) +
    10
  );
}

function drawDay(w: PdfWriter, day: ItineraryDay) {
  const headerH = 40;
  const first = day.slots[0];
  w.ensure(headerH + 12 + (first ? slotHeight(w, first) : 0));
  w.space(6);
  const top = w.y;
  w.roundedRect(PAGE.margin, top, w.contentWidth, headerH, 10, COLORS.night950);
  const label = `JOUR ${day.dayNumber}${day.date ? ` · ${formatDateFr(day.date)}` : ""}`;
  w.textAt(label, PAGE.margin + 14, top - 17, {
    size: 8.5,
    font: "bold",
    color: COLORS.gold300,
  });
  w.textAt(day.title, PAGE.margin + 14, top - 31, {
    size: 11.5,
    font: "bold",
    color: COLORS.white,
    maxWidth: w.contentWidth - 150,
  });
  w.textAt(`${approx(day.estimatedCostPerPerson)} / pers.`, PAGE.margin + w.contentWidth - 14, top - 17, {
    size: 8.5,
    color: COLORS.night100,
    align: "right",
  });
  w.y = top - headerH - 4;

  day.slots.forEach((slot, i) => {
    const height = slotHeight(w, slot);
    w.ensure(height);
    const rowTop = w.y;
    const { time, meta } = slotLines(slot);
    w.textAt(PERIOD_LABELS[slot.period], PAGE.margin + 4, rowTop - 17, {
      size: 9.5,
      font: "bold",
      color: COLORS.sun600,
    });
    if (time) w.textAt(time, PAGE.margin + 4, rowTop - 29, { size: 8, color: COLORS.muted });
    const x = PAGE.margin + LEFT_COL;
    const width = w.contentWidth - LEFT_COL - 12;
    let y = rowTop - 8;
    y -= wrappedAt(w, slot.title, x, y, width, { size: 10.5, font: "bold", color: COLORS.night950 });
    y -= wrappedAt(w, slot.description, x, y, width, { size: 9.5, color: COLORS.text });
    if (meta) wrappedAt(w, meta, x, y - 2, width, { size: 8.5, color: COLORS.muted });
    w.y = rowTop - height;
    if (i < day.slots.length - 1)
      w.line(PAGE.margin + LEFT_COL, w.y + 4, PAGE.margin + w.contentWidth, w.y + 4);
  });
  w.space(10);
}

function scheduleLabel(days: number[]) {
  if (days.length === 0) return "Idée en plus";
  return `Jour${days.length > 1 ? "s" : ""} ${days.join(", ")}`;
}

function listItem(w: PdfWriter, name: string, right: string, meta: string, description: string) {
  const rightW = w.width(right, 9.5, "bold") + 8;
  const nameH = wrappedHeight(w, name, w.contentWidth - rightW, 10.5, "bold");
  const metaH = wrappedHeight(w, meta, w.contentWidth, 8.5);
  const descH = wrappedHeight(w, description, w.contentWidth, 9.5);
  const height = nameH + metaH + descH + 16;
  w.ensure(height);
  const top = w.y;
  wrappedAt(w, name, PAGE.margin, top, w.contentWidth - rightW, {
    size: 10.5,
    font: "bold",
    color: COLORS.night950,
  });
  w.textAt(right, PAGE.margin + w.contentWidth, top - 10.5, {
    size: 9.5,
    font: "bold",
    color: COLORS.sun600,
    align: "right",
  });
  wrappedAt(w, meta, PAGE.margin, top - nameH - 1, w.contentWidth, { size: 8.5, color: COLORS.muted });
  wrappedAt(w, description, PAGE.margin, top - nameH - metaH - 3, w.contentWidth, {
    size: 9.5,
    color: COLORS.text,
  });
  w.y = top - height;
  w.line(PAGE.margin, w.y + 6, PAGE.margin + w.contentWidth, w.y + 6);
}

function mainActivities(plan: TravelPlan): PlanActivity[] {
  const scheduled = plan.activities.filter((a) => a.schedule.length > 0);
  const others = plan.activities.filter((a) => a.schedule.length === 0 && a.recommended);
  return [...scheduled, ...others].slice(0, MAX_ACTIVITIES);
}

function drawActivities(w: PdfWriter, plan: TravelPlan) {
  const activities = mainActivities(plan);
  if (activities.length === 0) return;
  sectionTitle(w, "Activités", "Les activités principales de ton voyage (prix indicatifs par personne).");
  for (const a of activities) {
    const days = [...new Set(a.schedule.map((s) => s.dayNumber))];
    listItem(
      w,
      a.name,
      a.estimatedCostPerPerson === 0 ? "Gratuit" : approx(a.estimatedCostPerPerson),
      [ACTIVITY_THEMES[a.theme].label, a.durationLabel, a.area, scheduleLabel(days)]
        .filter(Boolean)
        .join(" · "),
      a.description,
    );
  }
}

function drawRestaurants(w: PdfWriter, plan: TravelPlan) {
  const restaurants: PlanRestaurant[] = [
    ...plan.restaurants.filter((r) => r.schedule.length > 0),
    ...plan.restaurants.filter((r) => r.schedule.length === 0),
  ].slice(0, MAX_RESTAURANTS);
  if (restaurants.length === 0) return;
  sectionTitle(w, "Restaurants", "Adresses recommandées (établissements fictifs de démonstration).");
  for (const r of restaurants) {
    const days = [...new Set(r.schedule.map((s) => s.dayNumber))];
    listItem(
      w,
      r.name,
      `${approx(r.estimatedCostPerPerson)} / pers.`,
      [r.cuisine, RESTAURANT_KINDS[r.kind], r.area, "€".repeat(r.priceLevel), scheduleLabel(days)]
        .filter(Boolean)
        .join(" · "),
      r.description,
    );
  }
}

function drawBudget(w: PdfWriter, plan: TravelPlan) {
  const budget = plan.estimatedBudget;
  const rowH = 26;
  const perPerson = plan.travelers.total > 1;
  const tableH = rowH * (BUDGET_ROWS.length + 1) + 32 + (perPerson ? rowH : 0);
  sectionTitle(
    w,
    "Budget",
    `Estimation pour ${plural(plan.travelers.total, "voyageur")}, tout compris.`,
    tableH + 30,
  );

  const left = PAGE.margin;
  const right = PAGE.margin + w.contentWidth;
  let top = w.y;
  w.roundedRect(left, top, w.contentWidth, rowH, 8, COLORS.night50);
  w.textAt("POSTE", left + 14, top - 16.5, { size: 8, font: "bold", color: COLORS.muted });
  w.textAt("PART", left + w.contentWidth * 0.62, top - 16.5, { size: 8, font: "bold", color: COLORS.muted });
  w.textAt("MONTANT", right - 14, top - 16.5, { size: 8, font: "bold", color: COLORS.muted, align: "right" });
  top -= rowH;

  for (const row of BUDGET_ROWS) {
    const amount = budget.breakdown[row.id];
    const share = budget.total > 0 ? Math.round((amount / budget.total) * 100) : 0;
    w.textAt(row.label, left + 14, top - 17, { size: 10.5 });
    const barX = left + w.contentWidth * 0.62;
    w.roundedRect(barX, top - 11, 70, 5, 2.5, COLORS.night50);
    if (share > 0) w.roundedRect(barX, top - 11, Math.max(5, (70 * share) / 100), 5, 2.5, COLORS.sun500);
    w.textAt(`${share} %`, barX + 78, top - 16, { size: 8.5, color: COLORS.muted });
    w.textAt(approx(amount), right - 14, top - 17, { size: 10.5, font: "bold", align: "right" });
    top -= rowH;
    w.line(left + 10, top + 1, right - 10, top + 1);
  }

  top -= 6;
  w.roundedRect(left, top, w.contentWidth, 32, 10, COLORS.night950);
  w.textAt("Total estimé", left + 14, top - 20.5, { size: 12, font: "bold", color: COLORS.white });
  w.textAt(approx(budget.total), right - 14, top - 20.5, {
    size: 13,
    font: "bold",
    color: COLORS.sun400,
    align: "right",
  });
  top -= 32;
  if (perPerson) {
    w.textAt("Par personne", left + 14, top - 18, { size: 10.5, color: COLORS.muted });
    w.textAt(approx(budget.perPerson), right - 14, top - 18, { size: 10.5, font: "bold", align: "right" });
    top -= rowH;
  }
  w.y = top - 8;
  w.text(
    "Estimation indicative calculée à partir de données de démonstration : les prix réels varient selon les dates et les disponibilités.",
    { size: 8.5, font: "italic", color: COLORS.muted },
  );
}

// --- En-têtes et pieds de page ---------------------------------------------------------

function drawHeadersAndFooters(w: PdfWriter, plan: TravelPlan, generatedAt: Date) {
  const pages = w.doc.getPages();
  const total = pages.length;
  const footer = `OVO · Mon voyage à ${plan.destination.name} · Généré le ${longDate.format(generatedAt)} · Prix indicatifs`;
  pages.forEach((page, index) => {
    w.page = page;
    if (index === 0) return; // couverture
    drawLogo(w, PAGE.margin, PAGE.height - 50, 0.9, COLORS.night950);
    w.textAt(`Mon voyage à ${plan.destination.name}`, PAGE.width - PAGE.margin, PAGE.height - 47, {
      size: 8.5,
      color: COLORS.muted,
      align: "right",
      maxWidth: 300,
    });
    w.line(PAGE.margin, PAGE.height - 60, PAGE.width - PAGE.margin, PAGE.height - 60);
    w.line(PAGE.margin, 44, PAGE.width - PAGE.margin, 44);
    w.textAt(pdfSafe(footer), PAGE.margin, 30, {
      size: 7.5,
      color: COLORS.muted,
      maxWidth: w.contentWidth - 70,
    });
    w.textAt(`Page ${index + 1} / ${total}`, PAGE.width - PAGE.margin, 30, {
      size: 7.5,
      font: "bold",
      color: COLORS.night700,
      align: "right",
    });
  });
}
