/**
 * Images de la landing page, centralisées pour pouvoir les remplacer
 * facilement (par des fichiers locaux dans /public ou un CDN).
 * Les domaines distants doivent être autorisés dans next.config.ts.
 */
const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const heroImage = {
  src: unsplash("photo-1476514525535-07fb3b4ae5f1", 2400),
  alt: "Lac turquoise entouré de montagnes au lever du soleil",
};

export const destinationImages = {
  lisbonne: unsplash("photo-1585208798174-6cedd86e019a", 1200),
  barcelone: unsplash("photo-1583422409516-2895a77efded", 1200),
  amsterdam: unsplash("photo-1534351590666-13e3e96b5017", 1200),
  rome: unsplash("photo-1552832230-c0197dd311b5", 1200),
  marrakech: unsplash("photo-1597212618440-806262de4f6b", 1200),
  "new-york": unsplash("photo-1496442226666-8d4d0e62e6e9", 1200),
} as const;
