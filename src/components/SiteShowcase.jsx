import { Link } from "react-router-dom";
import { SITES, isExternalSite, siteHref } from "../data/sites.js";

/*
 * The three-business showcase: TCT, TCT FashionHub and TCT Trader.
 *
 * Every card carries the real TCT logo (public/tct-logo.png — a colourful
 * 420x345 mark with transparent padding, so it reads fine on white cards),
 * exactly like the reference site's three logo cards.
 */
function SiteCard({ site }) {
  const external = isExternalSite(site);
  const href = siteHref(site);

  const body = (
    <>
      <span className="sc-mark">
        <img src="/tct-logo.png" alt="" width="52" height="52" loading="lazy" />
      </span>
      <span className="sc-body">
        <strong>{site.name}</strong>
        <small>{site.tagline}</small>
      </span>
      <span className="sc-go" aria-hidden="true">
        <i className={`bi ${external ? "bi-box-arrow-up-right" : "bi-arrow-right"}`}></i>
      </span>
    </>
  );

  return external ? (
    <a
      className="site-card"
      style={{ "--sc": site.accent }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${site.name} — ${site.tagline} (opens in a new tab)`}
    >
      {body}
    </a>
  ) : (
    <Link
      className="site-card"
      style={{ "--sc": site.accent }}
      to={href}
      aria-label={`${site.name} — ${site.tagline}`}
    >
      {body}
    </Link>
  );
}

/* `hero` sits over the hero video (light label, white cards);
   `page` sits on a normal light section.

   NOTE: the variant class is prefixed (ss-hero / ss-page) on purpose — a bare
   `hero` class would also match the site's own `.hero` rules. */
export default function SiteShowcase({ variant = "hero" }) {
  return (
    <div className={`site-showcase ${variant === "page" ? "ss-page" : "ss-hero"}`}>
      <div className="ss-header">
        <div className="ss-brand-logo">
          <img
            src="/tct-logo.png"
            alt="Trend Code Technology"
            width="128"
            height="106"
            loading="lazy"
          />
        </div>
        {variant === "hero" ? (
          <p className="ss-label">Our Paths</p>
        ) : (
          <h2 className="ss-label">Explore Our Paths</h2>
        )}
      </div>
      <div className="ss-grid ss-grid-4">
        {SITES.map((site) => (
          <SiteCard key={site.key} site={site} />
        ))}
      </div>
    </div>
  );
}
