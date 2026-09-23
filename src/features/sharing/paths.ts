import { routes } from "@/config/site";

/** Chemin public d'un voyage partagé (le jeton est secret et aléatoire). */
export const sharedTripPath = (token: string) => `${routes.sharedTrip}/${token}`;
