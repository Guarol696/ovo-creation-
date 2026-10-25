import Link from "next/link";
import { routes, siteConfig, socialLinks } from "@/config/site";
import { Logo } from "./logo";

const columns = [
  {
    title: "Plateforme",
    links: [
      { label: "Formations", href: routes.academy },
      { label: "Parcours", href: routes.paths },
      { label: "Assistant", href: routes.assistant },
      { label: "Tarifs", href: routes.pricing },
    ],
  },
  {
    title: "EMPIRE",
    links: [
      { label: "À propos", href: routes.about },
      { label: "Contact", href: routes.contact },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Conditions d'utilisation", href: routes.terms },
      { label: "Confidentialité", href: routes.privacy },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t hairline bg-void">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)] md:py-24">
        <div className="grid content-start gap-5">
          <Logo />
          <p className="max-w-xs text-sm text-mist">{siteConfig.tagline}</p>
          {socialLinks.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Réseaux sociaux">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="meta inline-flex min-h-11 items-center text-silver hover:text-paper"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title} className="grid content-start gap-3">
            <p className="meta text-mist">{column.title}</p>
            <ul className="grid gap-1">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center text-sm text-silver transition-colors hover:text-paper">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="shell flex flex-col gap-2 border-t hairline py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="meta text-mist">
          © {new Date().getFullYear()} {siteConfig.name} — nom de travail
        </p>
        <p className="meta text-mist">Formations et données de démonstration clairement signalées</p>
      </div>
      {/* Signature typographique : le nom, en architecture, coupé par le bas de page. */}
      <div aria-hidden className="pointer-events-none overflow-hidden select-none">
        <p className="font-expanded display-xl translate-y-[22%] text-center leading-none text-outline">{siteConfig.name}</p>
      </div>
    </footer>
  );
}
