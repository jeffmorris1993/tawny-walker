import { Helmet } from 'react-helmet-async';

// Centralized per-route meta tags. Title goes through a single
// "<page> · Tawny & Co." formatter so every tab title reads consistently.
//
// Props:
//   title       string — page-specific headline
//   description string — 1-2 sentence summary; used for <meta description>
//                        + Open Graph + Twitter Card
//   path        string — '/' or '/listings/meridian-house'; combined with
//                        VITE_SITE_URL for canonical + OG url
//   image       string — absolute URL to an OG/Twitter share image
//   noindex     bool   — set true on admin/preview routes
//   jsonLd      object — Schema.org structured data emitted as
//                        <script type="application/ld+json">
//
// The post-build SEO script in scripts/build-seo.mjs writes the SAME meta
// tags directly into the per-route index.html files so AI crawlers (which
// don't run JS) see them too; this component keeps the runtime SPA in
// sync after client-side navigation.
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://example.com').replace(/\/$/, '');
const SITE_NAME = 'Tawny & Co.';
const DEFAULT_DESCRIPTION =
  'Design-driven real estate and renovation in Birmingham, Bloomfield Hills, and the wider Metro Detroit area, with broker Tawny Walker.';
const DEFAULT_IMAGE = `${SITE_URL}/videos/hero-poster.jpg`;

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd,
}) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} — ${DEFAULT_DESCRIPTION.split('.')[0]}.`;
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const ogImage = image && image.startsWith('http') ? image : `${SITE_URL}${image || ''}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD structured data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
