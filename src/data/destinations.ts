import { destinationImages } from "@/config/images";
import type { Destination } from "@/types/destination";

/**
 * Destinations de démonstration pour la section Inspiration.
 * Données statiques : elles seront remplacées par Supabase / des API
 * lors des prochaines étapes.
 */
export const featuredDestinations: Destination[] = [
  {
    slug: "lisbonne",
    city: "Lisbonne",
    country: "Portugal",
    tagline: "Tramways jaunes, miradouros et couchers de soleil sur le Tage.",
    image: { src: destinationImages.lisbonne, alt: "Tramway jaune dans une rue de Lisbonne" },
    fallbackGradient: "from-amber-400 via-orange-500 to-rose-600",
    styles: ["ville", "gastronomie"],
    budgetFrom: 380,
    idealDays: 4,
  },
  {
    slug: "barcelone",
    city: "Barcelone",
    country: "Espagne",
    tagline: "Gaudí le jour, tapas et rooftops la nuit.",
    image: { src: destinationImages.barcelone, alt: "La Sagrada Família à Barcelone" },
    fallbackGradient: "from-orange-400 via-red-500 to-fuchsia-700",
    styles: ["fete", "plage"],
    budgetFrom: 420,
    idealDays: 4,
  },
  {
    slug: "amsterdam",
    city: "Amsterdam",
    country: "Pays-Bas",
    tagline: "Canaux à vélo, musées et cafés cosy.",
    image: { src: destinationImages.amsterdam, alt: "Maisons au bord d'un canal à Amsterdam" },
    fallbackGradient: "from-sky-400 via-blue-600 to-indigo-800",
    styles: ["ville", "culture"],
    budgetFrom: 450,
    idealDays: 3,
  },
  {
    slug: "rome",
    city: "Rome",
    country: "Italie",
    tagline: "2 000 ans d'histoire et la meilleure pasta de ta vie.",
    image: { src: destinationImages.rome, alt: "Le Colisée de Rome au coucher du soleil" },
    fallbackGradient: "from-yellow-400 via-orange-500 to-red-700",
    styles: ["culture", "gastronomie"],
    budgetFrom: 400,
    idealDays: 4,
  },
  {
    slug: "marrakech",
    city: "Marrakech",
    country: "Maroc",
    tagline: "Souks, riads et désert aux portes de la ville.",
    image: { src: destinationImages.marrakech, alt: "Place animée de la médina de Marrakech" },
    fallbackGradient: "from-orange-500 via-rose-600 to-purple-800",
    styles: ["aventure", "detente"],
    budgetFrom: 350,
    idealDays: 5,
  },
  {
    slug: "new-york",
    city: "New York",
    country: "États-Unis",
    tagline: "La ville qui ne dort jamais, version road-trip urbain.",
    image: { src: destinationImages["new-york"], alt: "Skyline de Manhattan à New York" },
    fallbackGradient: "from-slate-400 via-blue-700 to-night-950",
    styles: ["ville", "fete"],
    budgetFrom: 1100,
    idealDays: 6,
  },
];
