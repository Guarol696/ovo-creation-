/**
 * Vidéos de démonstration : films libres de la Blender Foundation (licence
 * Creative Commons Attribution), servis par l'échantillon public de Google.
 * Elles n'ont AUCUN rapport avec le contenu des leçons : elles servent à
 * tester le lecteur. Remplacer les URL par les vraies vidéos des formations
 * (stockage Supabase, Mux, Vimeo…) ou définir NEXT_PUBLIC_DEMO_VIDEO_BASE.
 */
const base =
  process.env.NEXT_PUBLIC_DEMO_VIDEO_BASE?.replace(/\/$/, "") ||
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";

export interface VideoSource {
  src: string;
  title: string;
  credit: string;
}

export const demoVideos: Record<string, VideoSource> = {
  bunny: {
    src: `${base}/BigBuckBunny.mp4`,
    title: "Big Buck Bunny",
    credit: "© Blender Foundation — CC BY 3.0 (vidéo de démonstration)",
  },
  dream: {
    src: `${base}/ElephantsDream.mp4`,
    title: "Elephants Dream",
    credit: "© Blender Foundation — CC BY 2.5 (vidéo de démonstration)",
  },
  sintel: {
    src: `${base}/Sintel.mp4`,
    title: "Sintel",
    credit: "© Blender Foundation — CC BY 3.0 (vidéo de démonstration)",
  },
  steel: {
    src: `${base}/TearsOfSteel.mp4`,
    title: "Tears of Steel",
    credit: "© Blender Foundation — CC BY 3.0 (vidéo de démonstration)",
  },
};

export const videoFor = (key: string | undefined) => (key ? demoVideos[key] : undefined);
