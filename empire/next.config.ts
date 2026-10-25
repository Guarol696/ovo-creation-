import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Le dépôt contient aussi l'application OVO à sa racine : EMPIRE est un projet autonome.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
