// Post-build SEO bake-out.
//
// Vite's build emits a single dist/index.html that serves every route. AI
// crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot) don't run JS, so they
// see only an empty <div id="root">. This script walks the public route
// table, fetches the listing rows from Supabase, and writes one HTML file
// per route into dist/ with the title, meta description, canonical, Open
// Graph / Twitter card, and JSON-LD baked into the source. Vercel serves
// the existing static file when the path matches (e.g.
// /listings/foo/index.html) and falls back to the SPA catchall otherwise,
// so the SPA still hydrates on top.
//
// Also emits sitemap.xml, robots.txt, and llms.txt at the dist/ root.
//
// Safe to re-run. Writes files only — never mutates source. If Supabase is
// unreachable, the static routes are still emitted and the script exits 0.
//
// Wired in via `npm run build`: `vite build && node scripts/build-seo.mjs`.

import { readFileSync } from 'node:fs';
import { writeFile, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// ─── env ────────────────────────────────────────────────────────────────────
// Vite loads .env.local automatically for the front-end, but a plain Node
// script doesn't — read and parse it manually. No dotenv dep needed.
function loadEnv(path) {
  try {
    const text = readFileSync(path, 'utf8');
    const out = {};
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      out[key] = val;
    }
    return out;
  } catch {
    return {};
  }
}

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(REPO_ROOT, 'dist');

const env = { ...loadEnv(join(REPO_ROOT, '.env.local')), ...process.env };

const SITE_URL  = (env.VITE_SITE_URL || 'https://example.com').replace(/\/$/, '');
const SITE_NAME = 'Tawny & Co.';
const DEFAULT_DESCRIPTION =
  'Design-driven real estate and renovation in Birmingham, Bloomfield Hills, and the wider Metro Detroit area, with broker Tawny Walker.';
const DEFAULT_IMAGE = `${SITE_URL}/videos/hero-poster.jpg`;

// Mirror src/data/listings.js STUDIO (duplicated rather than imported to
// keep this script free of the Vite/JSX module graph).
const STUDIO = {
  phone: '248-860-6114',
  email: 'TAWNYwalker@WeAreDobi.com',
  brokeredBy: 'Brokered by DOBI Real Estate',
};

// ─── helpers ────────────────────────────────────────────────────────────────
// Minimal HTML-attribute escape for meta values. The values come from the
// DB (operator-controlled) so we don't need to defend against script
// injection per se, but we do need to keep the attribute quoting intact.
function escapeAttr(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// JSON-LD goes inside a <script> element; escape `<` so a stray substring
// can't close the script tag and inject markup.
function escapeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

// Mirror of src/lib/money.js parseMoney() — returns just the numeric value.
// Duplicated for the same reason as STUDIO.
function parseMoneyValue(s) {
  const str = String(s ?? '').trim();
  if (!str) return 0;
  const suffixMatch = str.match(/\/[a-z]+$/i);
  const suffix = suffixMatch ? suffixMatch[0] : '';
  const body = (suffix ? str.slice(0, -suffix.length) : str)
    .replace(/[$,\s]/g, '')
    .trim();
  let multiplier = 1;
  let numeric = body;
  if (/M$/i.test(body))      { multiplier = 1_000_000; numeric = body.slice(0, -1); }
  else if (/K$/i.test(body)) { multiplier = 1_000;     numeric = body.slice(0, -1); }
  const value = parseFloat(numeric) * multiplier;
  return isFinite(value) ? value : 0;
}

// Strip the runtime defaults (title, description) and any prior bake of
// SEO tags from the index.html template, then inject the route's tag
// block right before </head>. Re-running over an already-baked file is a
// no-op for the source dist/index.html because we always start from a
// fresh read of the template.
function injectHead(template, tags) {
  let html = template;
  // Remove any existing tags we own so a re-bake doesn't accumulate.
  html = html.replace(/\s*<title>[\s\S]*?<\/title>/i, '');
  html = html.replace(/\s*<meta\s+name=["']description["'][^>]*>/gi, '');
  html = html.replace(/\s*<link\s+rel=["']canonical["'][^>]*>/gi, '');
  html = html.replace(/\s*<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '');
  html = html.replace(/\s*<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '');
  html = html.replace(/\s*<meta\s+name=["']robots["'][^>]*>/gi, '');
  html = html.replace(/\s*<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');
  return html.replace(/<\/head>/i, `${tags}\n  </head>`);
}

// Build the meta+OG+JSON-LD block for one route.
function renderTags({ title, description, path, image, jsonLd, noindex }) {
  const fullTitle = title
    ? `${title} · ${SITE_NAME}`
    : `${SITE_NAME} — Real estate, reimagined.`;
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const ogImage = image && /^https?:\/\//i.test(image)
    ? image
    : `${SITE_URL}${image && image.startsWith('/') ? image : `/${image || ''}`}`.replace(/\/$/, '');
  const lines = [
    `    <title>${escapeAttr(fullTitle)}</title>`,
    `    <meta name="description" content="${escapeAttr(description)}" />`,
    `    <link rel="canonical" href="${escapeAttr(url)}" />`,
    noindex ? `    <meta name="robots" content="noindex, nofollow" />` : null,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
    `    <meta property="og:title" content="${escapeAttr(fullTitle)}" />`,
    `    <meta property="og:description" content="${escapeAttr(description)}" />`,
    `    <meta property="og:url" content="${escapeAttr(url)}" />`,
    `    <meta property="og:image" content="${escapeAttr(ogImage)}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapeAttr(fullTitle)}" />`,
    `    <meta name="twitter:description" content="${escapeAttr(description)}" />`,
    `    <meta name="twitter:image" content="${escapeAttr(ogImage)}" />`,
    jsonLd
      ? `    <script type="application/ld+json">${escapeJsonLd(jsonLd)}</script>`
      : null,
  ].filter(Boolean);
  return lines.join('\n');
}

async function writeFileAt(relPath, contents) {
  const full = join(DIST, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, contents, 'utf8');
}

// ─── routes ─────────────────────────────────────────────────────────────────
function staticRoutes() {
  return [
    {
      path: '/',
      file: 'index.html',
      title: null, // homepage uses the brand line, not a "X · Tawny & Co."
      description: 'Tawny Walker — design-driven real estate and renovation across Birmingham, Bloomfield Hills, and the wider Metro Detroit area.',
      changefreq: 'weekly',
      priority: '1.0',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'RealEstateAgent',
        name: 'Tawny Walker',
        alternateName: 'Tawny & Co.',
        description:
          'Michigan real estate professional recognized for an elevated aesthetic and a strategic, design-driven approach to the work.',
        url: SITE_URL,
        areaServed: [
          'Birmingham, MI', 'Bloomfield Hills, MI', 'Beverly Hills, MI',
          'Royal Oak, MI', 'Troy, MI', 'Novi, MI', 'Northville, MI',
          'West Bloomfield, MI', 'Metro Detroit, MI',
        ],
        telephone: STUDIO.phone,
        email: STUDIO.email,
      },
    },
    {
      path: '/about',
      file: 'about/index.html',
      title: 'About Tawny Walker',
      description: 'Tawny Walker is a Michigan real estate professional recognized for an elevated aesthetic and a strategic, design-driven approach to representing buyers, sellers, and investors.',
      changefreq: 'monthly',
      priority: '0.8',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Tawny Walker',
        jobTitle: 'Real Estate Agent',
        worksFor: { '@type': 'Organization', name: STUDIO.brokeredBy },
        telephone: STUDIO.phone,
        email: STUDIO.email,
        areaServed: 'Metro Detroit, MI',
      },
    },
    {
      path: '/listings',
      file: 'listings/index.html',
      title: 'Current Listings',
      description: 'Active and upcoming residences represented by Tawny Walker across Birmingham, Bloomfield Hills, and the wider Metro Detroit area.',
      changefreq: 'daily',
      priority: '0.9',
      jsonLd: null,
    },
    {
      path: '/listings/sold',
      file: 'listings/sold/index.html',
      title: 'Sold',
      description: 'Recent sold placements by Tawny Walker across Birmingham, Bloomfield Hills, and the wider Metro Detroit area.',
      changefreq: 'weekly',
      priority: '0.7',
      jsonLd: null,
    },
    {
      path: '/inquiry',
      file: 'inquiry/index.html',
      title: 'Begin Your Inquiry',
      description: "Reach out to Tawny Walker — choose Buyer, Seller, Investor, or Agent/Broker and share what you're after.",
      changefreq: 'monthly',
      priority: '0.6',
      jsonLd: null,
    },
  ];
}

function listingRoute(l) {
  const addr = l.addr || 'Listing';
  const description = l.tagline
    || l.blurb
    || [addr, l.street, l.loc].filter(Boolean).join(' — ')
    || 'Residence represented by Tawny Walker.';
  // photos[0].url is a real CDN URL when the studio has uploaded a hero;
  // otherwise the legacy `img` column holds a bundler key (e.g.
  // "kitchenMarbleIsl") that only resolves through src/components/Photo.
  // Don't bake bundler keys into OG tags — fall back to null and let the
  // caller substitute the default hero poster.
  const uploaded = Array.isArray(l.photos) && l.photos[0]?.url;
  const legacyImg = l.img && /^(https?:)?\/\//i.test(l.img) ? l.img : null;
  const heroImage = uploaded || legacyImg || null;
  const price = parseMoneyValue(l.price);
  const offers = price > 0 ? {
    '@type': 'Offer',
    price,
    priceCurrency: 'USD',
    availability: l.status === 'Sold'
      ? 'https://schema.org/SoldOut'
      : 'https://schema.org/InStock',
  } : undefined;
  // JSON.stringify drops undefined values, so building the object with
  // undefineds for "skip this field" is the cleanest way to omit
  // optional Schema.org keys when source data is missing.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: addr,
    description,
    url: `${SITE_URL}/listings/${l.id}`,
    image: heroImage ? [heroImage] : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: l.street || undefined,
      addressLocality: l.loc || undefined,
      addressRegion: 'MI',
      addressCountry: 'US',
    },
    offers,
    numberOfRooms: l.beds || undefined,
    numberOfBathroomsTotal: l.baths || undefined,
  };
  return {
    path: `/listings/${l.id}`,
    file: `listings/${l.id}/index.html`,
    title: addr,
    description,
    image: heroImage,
    lastmod: l.updated_at || null,
    changefreq: 'weekly',
    priority: l.status === 'Sold' ? '0.5' : '0.8',
    jsonLd,
  };
}

// ─── data ───────────────────────────────────────────────────────────────────
async function fetchListings() {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    console.warn('[seo] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing; skipping listing routes.');
    return [];
  }
  try {
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from('listings')
      .select('id, addr, street, loc, price, status, beds, baths, sqft, tagline, blurb, photos, img, updated_at')
      .neq('status', 'Draft');
    if (error) {
      console.warn(`[seo] Supabase fetch failed (${error.message}); skipping listing routes.`);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn(`[seo] Supabase unreachable (${err.message}); skipping listing routes.`);
    return [];
  }
}

// ─── sitemap / robots / llms ────────────────────────────────────────────────
function buildSitemap(routes, buildTime) {
  const xmlEntries = routes.map((r) => {
    const lastmod = r.lastmod || buildTime;
    return `  <url>
    <loc>${escapeAttr(`${SITE_URL}${r.path}`)}</loc>
    <lastmod>${escapeAttr(lastmod)}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`;
}

function buildRobots() {
  return `# Tawny & Co. — public crawling allowed except for studio surfaces.
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /studio/

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

function buildLlmsTxt(staticList, listings) {
  const active = listings.filter((l) => l.status !== 'Sold');
  const sold   = listings.filter((l) => l.status === 'Sold');
  const fmtListing = (l) => {
    const blurb = (l.tagline || l.blurb || [l.street, l.loc].filter(Boolean).join(', ') || 'Residence').trim();
    return `- [${l.addr || 'Listing'}](${SITE_URL}/listings/${l.id}): ${blurb}`;
  };
  return `# ${SITE_NAME}

${DEFAULT_DESCRIPTION}

## About

- [About Tawny Walker](${SITE_URL}/about): Michigan real estate professional with an elevated aesthetic and a design-driven approach to representing buyers, sellers, and investors.

## Current listings

- [All current listings](${SITE_URL}/listings): Active and upcoming residences across Metro Detroit.
${active.length ? active.map(fmtListing).join('\n') : '- (No active listings at the moment.)'}

## Sold listings

- [Sold archive](${SITE_URL}/listings/sold): Recent sold placements.
${sold.length ? sold.map(fmtListing).join('\n') : '- (No sold listings yet.)'}

## Contact

- [Begin an inquiry](${SITE_URL}/inquiry): Buyer, Seller, Investor, or Agent/Broker intake.
- Phone: ${STUDIO.phone}
- Email: ${STUDIO.email}
- ${STUDIO.brokeredBy}
`;
}

// ─── main ───────────────────────────────────────────────────────────────────
async function main() {
  // Source-of-truth template is whatever Vite just emitted to dist/index.html.
  try {
    await access(join(DIST, 'index.html'));
  } catch {
    console.error('[seo] dist/index.html not found — run `vite build` first.');
    process.exit(1);
  }
  const template = readFileSync(join(DIST, 'index.html'), 'utf8');
  const buildTime = new Date().toISOString();

  const listings = await fetchListings();
  const statics = staticRoutes();
  const listingRoutes = listings.map(listingRoute);
  const allRoutes = [...statics, ...listingRoutes];

  let written = 0;
  for (const route of allRoutes) {
    const tags = renderTags({
      title: route.title,
      description: route.description,
      path: route.path,
      image: route.image || DEFAULT_IMAGE,
      jsonLd: route.jsonLd,
    });
    const html = injectHead(template, tags);
    await writeFileAt(route.file, html);
    written++;
  }

  await writeFileAt('sitemap.xml', buildSitemap(allRoutes, buildTime));
  await writeFileAt('robots.txt', buildRobots());
  await writeFileAt('llms.txt', buildLlmsTxt(statics, listings));

  console.log(
    `[seo] wrote ${written} HTML files ` +
    `(${statics.length} static + ${listingRoutes.length} listings), ` +
    `plus sitemap.xml, robots.txt, llms.txt. SITE_URL=${SITE_URL}`,
  );
}

main().catch((err) => {
  // Treat as a hard build failure only if something truly unexpected blew
  // up (file I/O on dist/, etc). Supabase failures are caught earlier and
  // degrade to static-only output.
  console.error('[seo] build-seo failed:', err);
  process.exit(1);
});
