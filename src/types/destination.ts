import type { TravelStyle } from "./trip";

export interface Destination {
  slug: string;
  city: string;
  country: string;
  tagline: string;
  image: {
    src: string;
    alt: string;
  };
  /** Dégradé de secours affiché sous l'image (et si elle ne charge pas). */
  fallbackGradient: string;
  styles: TravelStyle[];
  /** Estimation indicative par personne, en euros. */
  budgetFrom: number;
  idealDays: number;
}
