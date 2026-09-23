import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Domaines d'images distants autorisés (ajouter ici les futurs CDN / API).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
