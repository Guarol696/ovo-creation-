import Link from "next/link";
import { footerNav, siteConfig, socialLinks } from "@/config/site";
import { InstagramIcon, TikTokIcon } from "@/components/icons/social-icons";
import { Container } from "@/components/ui/container";
import { Logo } from "./logo";
import { MobileTabBar } from "./mobile-tab-bar";

const socials = [
  { label: "Instagram", href: socialLinks.instagram, Icon: InstagramIcon },
  { label: "TikTok", href: socialLinks.tiktok, Icon: TikTokIcon },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-night-950 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 left-1/2 h-96 w-[40rem] max-w-full -translate-x-1/2 rounded-full bg-sun-500/10 blur-3xl"
      />
      {/* Mobile : marge basse pour que la barre d'onglets ne masque pas la fin du pied de page. */}
      <Container className="relative pt-16 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:pt-20 lg:pb-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-night-100/70">
              {siteConfig.meaning} ? Dis-nous tes envies, ton budget et tes dates : OVO imagine le voyage qui
              te ressemble.
            </p>
            <ul className="mt-6 flex gap-3" aria-label="Réseaux sociaux">
              {socials.map(({ label, href, Icon }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid size-11 place-items-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-sun-400 hover:text-sun-400"
                    >
                      <Icon className="size-5" />
                    </a>
                  ) : (
                    <span
                      title={`${label} — bientôt`}
                      aria-label={`${label} (bientôt disponible)`}
                      className="grid size-11 place-items-center rounded-full border border-white/10 text-white/40"
                    >
                      <Icon className="size-5" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="text-xs font-bold tracking-[0.2em] text-gold-300 uppercase">{group.title}</p>
              <ul className="mt-4">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm text-night-100/75 transition-colors hover:text-white lg:min-h-9"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-night-100/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name} — {siteConfig.meaning}. Tous droits réservés.
          </p>
          <p>Fait pour celles et ceux qui ont envie de partir.</p>
        </div>
      </Container>
      <MobileTabBar />
    </footer>
  );
}
