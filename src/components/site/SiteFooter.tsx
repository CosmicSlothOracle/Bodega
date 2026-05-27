import Link from "next/link";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { site, nav } from "@/lib/site";

const socialIcon = {
  Instagram: FaInstagram,
  Facebook: FaFacebookF,
} as const;

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border-soft bg-[color-mix(in_srgb,var(--bloom-wine)_14%,var(--bloom-ink))] mt-24">
      <div className="shell py-20 sm:py-28">
        {/* Atmospheric brand line */}
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-3 font-display text-bloom-cream">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-bloom-ochre" />
              <span className="text-2xl">{site.name}</span>
            </div>
            <p className="text-text-secondary leading-relaxed">
              Eine kleine mediterrane Insel an der Bühlot. Tapas vom Holzbrett,
              spanische Tropfen, Stimmen, Schatten, Kerzenlicht — und ein langer
              Abend, der vergisst, wie spät es geworden ist.
            </p>
            <p className="text-xs uppercase tracking-[0.28em] text-bloom-ochre/80">
              Salud · Buen provecho
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.28em] text-bloom-sand/70 font-sans">
              Öffnungszeiten
            </h4>
            <ul className="space-y-2 text-text-secondary">
              {site.hours.map((h) => (
                <li key={h.label} className="text-sm leading-snug">
                  <span className="block text-bloom-cream">{h.label}</span>
                  <span>{h.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.28em] text-bloom-sand/70 font-sans">
              Kontakt
            </h4>
            <address className="not-italic text-text-secondary text-sm space-y-1">
              <div>{site.contact.address.street}</div>
              <div>
                {site.contact.address.zip} {site.contact.address.city}
              </div>
              <div className="pt-2">
                <a href={`tel:${site.contact.phone}`}>
                  {site.contact.phoneDisplay}
                </a>
              </div>
              <div>
                <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              </div>
            </address>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.28em] text-bloom-sand/70 font-sans">
              Folgen
            </h4>
            <div className="flex items-center gap-3">
              {site.socials.map((s) => {
                const Icon = socialIcon[s.label as keyof typeof socialIcon];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="h-11 w-11 inline-flex items-center justify-center rounded-full border border-border-soft text-bloom-cream hover:border-bloom-ochre hover:text-bloom-ochre transition"
                  >
                    {Icon ? <Icon size={16} /> : null}
                  </a>
                );
              })}
            </div>

            <div className="pt-6">
              <Link
                href={nav.cta.href}
                className="inline-flex text-sm uppercase tracking-[0.18em] text-bloom-ochre hover:text-bloom-cream"
              >
                {nav.cta.label} →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs uppercase tracking-[0.22em] text-text-muted">
          <div>
            © {new Date().getFullYear()} {site.name} · Inh. {site.owner}
          </div>
          <div className="flex items-center gap-6">
            {nav.secondary.map((s) => (
              <Link key={s.href} href={s.href} className="hover:text-bloom-cream">
                {s.label}
              </Link>
            ))}
            <Link href="/impressum" className="hover:text-bloom-cream">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-bloom-cream">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
