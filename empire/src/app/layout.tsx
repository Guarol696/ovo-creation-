import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Cursor } from "@/components/motion/cursor";
import { MotionProvider } from "@/components/motion/motion-provider";
import { preferencesBootScript } from "@/components/motion/preferences";
import { RevealRuntime } from "@/components/motion/reveal-runtime";
import { TransitionProvider } from "@/components/motion/transition-provider";
import { siteConfig } from "@/config/site";
import { publicEnv } from "@/lib/env";
import "./globals.css";

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"], display: "swap" });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: `${siteConfig.name} — Build your empire`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Build your empire`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${archivo.variable} ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Préférences d'affichage appliquées avant le premier rendu (pas de flash). */}
        <script dangerouslySetInnerHTML={{ __html: preferencesBootScript }} />
      </head>
      <body className="grain flex min-h-dvh flex-col">
        <MotionProvider>
          <TransitionProvider>
            <Header />
            <main id="contenu" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <Cursor />
            <RevealRuntime />
          </TransitionProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
