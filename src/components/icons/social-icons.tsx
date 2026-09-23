import type { SVGProps } from "react";

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 3c.3 2.2 1.6 3.7 3.9 3.9v3a7.3 7.3 0 0 1-3.8-1.2v6.1c0 3.4-2.5 6.2-6.1 6.2A6 6 0 0 1 4.5 15c0-3.6 3.1-6.3 6.9-5.8v3.2c-1.8-.4-3.6.8-3.6 2.7 0 1.6 1.2 2.8 2.8 2.8 1.7 0 2.9-1.2 2.9-3.3V3h3.1Z" />
    </svg>
  );
}
