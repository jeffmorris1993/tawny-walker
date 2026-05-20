import { Link, useParams, Navigate } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import Photo, { PHOTOS } from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import StatusChip from '../components/StatusChip';
import { useListing, useRelatedListings } from '../lib/queries';

// The detail page is the same content rendered in two visual directions.
// Section order: breadcrumb → hero → head (name, address, tagline subtitle,
// price, specs) → gallery → CTA → related rail.

function splitName(name) {
  const parts = name.split(' ');
  return [parts[0], parts.slice(1).join(' ')];
}

// ─── DIRECTION A ────────────────────────────────────────────────────────────
function ListingDetailA({ L }) {
  const t = useTheme();
  const related = useRelatedListings(L.id);

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <TopNav active="Listings" />

      {/* breadcrumb */}
      <div style={{
        padding: 'clamp(20px, 3vw, 32px) clamp(20px, 4.4vw, 64px) 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{
          fontFamily: t.eyebrowFont, fontSize: 10.5,
          letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint,
        }}>
          The Index / {t.statusLabels[L.status] || L.status} /{' '}
          <span style={{ color: t.fgPage }}>{L.addr}</span>
        </span>
        <Link to="/listings" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: t.eyebrowFont, fontSize: 10.5,
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: t.fgPage, borderBottom: `1px solid ${t.fgPage}`, paddingBottom: 4, cursor: 'pointer',
          }}>← Return to the Index</span>
        </Link>
      </div>

      {/* HERO */}
      <div style={{ padding: '0 clamp(20px, 4.4vw, 64px)' }}>
        <Photo label="" tone={L.tone} height={'clamp(360px, 50vw, 720px)'} src={L.img || PHOTOS.livingMarble} />
      </div>

      {/* HEAD */}
      <div style={{ padding: 'clamp(40px, 5vw, 64px) clamp(20px, 4.4vw, 64px) 80px' }}>
        <div className="tw-detail-head" style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'clamp(28px, 5vw, 80px)', alignItems: 'flex-end',
        }}>
          <div>
            <h1 style={{
              fontFamily: t.fonts.display, fontWeight: 300,
              fontSize: 'clamp(48px, 6.7vw, 96px)', letterSpacing: '-0.022em', lineHeight: 0.95,
              margin: 0,
            }}>
              {splitName(L.addr)[0]} {splitName(L.addr)[1] && <em style={{ fontStyle: 'italic' }}>{splitName(L.addr)[1]}</em>}.
            </h1>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 'clamp(18px, 1.8vw, 24px)', color: t.fgMuted }}>
                {L.street}
              </span>
              <span style={{
                fontFamily: t.eyebrowFont, fontSize: 11,
                letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint,
              }}>{L.loc}</span>
            </div>
            {L.tagline && (
              <p style={{
                margin: '22px 0 0', maxWidth: 640,
                fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400,
                fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: 1.35,
                color: t.fgPage, letterSpacing: '-0.005em',
              }}>{L.tagline}</p>
            )}
          </div>
          <div className="tw-detail-offer" style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: t.eyebrowFont, fontSize: 10.5,
              letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgFaint,
            }}>Offered at</div>
            <div style={{
              fontFamily: t.fonts.display, fontWeight: 300,
              fontSize: 'clamp(40px, 4.8vw, 64px)', marginTop: 4, letterSpacing: '-0.01em',
            }}>{L.price}</div>
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14,
              alignItems: 'center', flexWrap: 'wrap',
            }}>
              <StatusChip status={L.status} size="lg" />
              {L.listedAt && (
                <>
                  <span style={{ color: t.fgFaint }}>·</span>
                  <span style={{
                    fontFamily: t.eyebrowFont, fontSize: 10.5,
                    letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint,
                  }}>Listed {L.listedAt}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <SpecRow L={L} />
      </div>

      {/* GALLERY */}
      <Gallery L={L} />

      {/* CTA */}
      <div style={{ padding: 'clamp(0px, 1vw, 8px) clamp(20px, 4.4vw, 64px) clamp(56px, 8vw, 120px)' }}>
        <div className="tw-detail-cta" style={{
          padding: 'clamp(40px, 6vw, 80px) clamp(28px, 6vw, 88px)',
          background: t.bgDark, color: t.palette.bone,
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'clamp(28px, 6vw, 80px)', alignItems: 'center',
        }}>
          <div>
            <span style={{
              fontFamily: t.eyebrowFont, fontSize: 11,
              letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(251,249,245,0.6)',
            }}>Continue</span>
            <h2 style={{
              fontFamily: t.fonts.display, fontWeight: 300,
              fontSize: 'clamp(36px, 4.5vw, 56px)', margin: '18px 0 0',
              lineHeight: 1.05, letterSpacing: '-0.015em',
            }}>
              Arrange a <em style={{ fontStyle: 'italic' }}>private viewing</em>.
            </h2>
            <p style={{
              marginTop: 16, fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 'clamp(17px, 1.7vw, 20px)', color: 'rgba(251,249,245,0.7)',
              maxWidth: 520, lineHeight: 1.5,
            }}>
              Shown by appointment with Tawny — she prefers weekday mornings, when the light is at its best.
            </p>
          </div>
          <div>
            <Link to="/#inquiry" style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '24px 32px', background: t.palette.bone, color: t.palette.ink,
                fontFamily: t.eyebrowFont, fontSize: 11.5,
                letterSpacing: '0.28em', textTransform: 'uppercase', cursor: 'pointer',
              }}>
                Inquire
                <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 24 }}>→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* CONTINUE THROUGH THE LISTINGS */}
      <RelatedRail related={related} />

      <SiteFooter />
      <DetailStyles />
    </div>
  );
}

// ─── DIRECTION B ────────────────────────────────────────────────────────────
function ListingDetailB({ L }) {
  const t = useTheme();
  const related = useRelatedListings(L.id);
  const emerald = t.palette.emerald;

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <TopNav active="Listings" />

      {/* breadcrumb */}
      <div style={{
        padding: 'clamp(20px, 3vw, 32px) clamp(20px, 5vw, 72px) 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{
          fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
          letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgFaint,
        }}>
          {t.indexNoun} / {t.statusLabels[L.status] || L.status} /{' '}
          <span style={{ color: emerald }}>{L.addr}</span>
        </span>
        <Link to="/listings" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            color: emerald, borderBottom: `1px solid ${emerald}`, paddingBottom: 4, cursor: 'pointer',
          }}>← Return to {t.listingNoun}</span>
        </Link>
      </div>

      {/* HERO */}
      <div style={{ padding: '0 clamp(20px, 5vw, 72px)' }}>
        <Photo label="" tone={L.tone} height={'clamp(360px, 50vw, 720px)'} src={L.img || PHOTOS.livingMarble} />
      </div>

      {/* HEAD */}
      <div style={{ padding: 'clamp(40px, 5vw, 64px) clamp(20px, 5vw, 72px) 80px' }}>
        <div className="tw-detail-head" style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'clamp(28px, 5vw, 80px)', alignItems: 'flex-end',
        }}>
          <div>
            <h1 style={{
              fontFamily: t.fonts.display, fontWeight: 400,
              fontSize: 'clamp(48px, 6.7vw, 96px)', letterSpacing: '-0.022em', lineHeight: 0.95,
              color: emerald, margin: 0,
            }}>
              {splitName(L.addr)[0]} {splitName(L.addr)[1] && <em style={{ fontStyle: 'italic' }}>{splitName(L.addr)[1]}</em>}.
            </h1>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 'clamp(18px, 1.8vw, 24px)', color: t.fgMuted }}>
                {L.street}
              </span>
              <span style={{
                fontFamily: t.eyebrowFont, fontSize: 10.5, fontWeight: 600,
                letterSpacing: '0.26em', textTransform: 'uppercase', color: t.fgFaint,
              }}>{L.loc}</span>
            </div>
            {L.tagline && (
              <p style={{
                margin: '22px 0 0', maxWidth: 640,
                fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400,
                fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: 1.35,
                color: emerald, letterSpacing: '-0.005em',
              }}>{L.tagline}</p>
            )}
          </div>
          <div className="tw-detail-offer" style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
              letterSpacing: '0.32em', textTransform: 'uppercase', color: t.palette.gold,
            }}>Offered at</div>
            <div style={{
              fontFamily: t.fonts.display, fontWeight: 400,
              fontSize: 'clamp(40px, 4.8vw, 64px)', color: emerald,
              marginTop: 4, letterSpacing: '-0.01em',
            }}>{L.price}</div>
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 14, marginTop: 14,
              alignItems: 'center', flexWrap: 'wrap',
            }}>
              <StatusChip status={L.status} size="lg" />
              {L.listedAt && (
                <>
                  <span style={{ color: t.fgFaint }}>·</span>
                  <span style={{
                    fontFamily: t.eyebrowFont, fontSize: 9.5, fontWeight: 600,
                    letterSpacing: '0.26em', textTransform: 'uppercase', color: t.fgFaint,
                  }}>Listed {L.listedAt}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <SpecRow L={L} />
      </div>

      {/* GALLERY */}
      <Gallery L={L} />

      {/* CTA — emerald with motif */}
      <div style={{ padding: '0 clamp(20px, 5vw, 72px) clamp(56px, 8vw, 120px)' }}>
        <div className="tw-detail-cta" style={{
          padding: 'clamp(40px, 6vw, 80px) clamp(28px, 6vw, 88px)',
          background: emerald, color: '#FFFFFF',
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'clamp(28px, 6vw, 80px)', alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -100, right: -100, width: 320, height: 320,
            border: `1px solid ${t.palette.gold}`, borderRadius: '50%', opacity: 0.15,
          }} />
          <div style={{ position: 'relative' }}>
            <span style={{
              fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
              letterSpacing: '0.32em', textTransform: 'uppercase', color: t.palette.gold,
            }}>Continue</span>
            <h2 style={{
              fontFamily: t.fonts.display, fontWeight: 400,
              fontSize: 'clamp(36px, 4.5vw, 56px)', margin: '18px 0 0',
              lineHeight: 1.05, letterSpacing: '-0.015em',
            }}>
              Arrange a <em style={{ fontStyle: 'italic' }}>private viewing</em>.
            </h2>
            <p style={{
              marginTop: 16, fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 'clamp(17px, 1.7vw, 20px)', color: 'rgba(255,255,255,0.78)',
              maxWidth: 520, lineHeight: 1.5,
            }}>
              Shown by appointment with Tawny — she prefers weekday mornings, when the light is at its best.
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <Link to="/#inquiry" style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '24px 32px', background: '#FFFFFF', color: emerald,
                fontFamily: t.eyebrowFont, fontSize: 11, fontWeight: 600,
                letterSpacing: '0.28em', textTransform: 'uppercase', cursor: 'pointer',
              }}>
                Inquire
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 24 }}>→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      <RelatedRail related={related} />

      <SiteFooter />
      <DetailStyles />
    </div>
  );
}

// ─── Shared building blocks ─────────────────────────────────────────────────
function SpecRow({ L }) {
  const t = useTheme();
  const isB = t.key === 'B';
  const items = [
    { l: 'Bedrooms', v: L.beds },
    { l: 'Baths',    v: L.baths },
    { l: 'Interior', v: typeof L.sqft === 'string' ? `${L.sqft} sf` : L.sqft },
    { l: 'Lot',      v: L.lot },
  ];
  return (
    <div className="tw-detail-specs" style={{
      marginTop: 'clamp(40px, 5vw, 64px)', paddingTop: 32, paddingBottom: 32,
      borderTop: `1px solid ${isB ? t.palette.emerald : t.line}`,
      borderBottom: `1px solid ${t.line}`,
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    }}>
      {items.map((s, i, arr) => (
        <div key={s.l} style={{
          borderRight: i < arr.length - 1 ? `1px solid ${t.line}` : 'none',
          padding: '0 clamp(12px, 1.6vw, 24px)',
        }}>
          <div style={{
            fontFamily: t.eyebrowFont,
            fontSize: 10, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.3em' : '0.28em', textTransform: 'uppercase',
            color: isB ? t.palette.gold : t.fgFaint,
          }}>{s.l}</div>
          <div style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(22px, 2.6vw, 36px)',
            color: isB ? t.palette.emerald : t.fgPage,
            marginTop: 6, letterSpacing: '-0.01em',
          }}>{s.v ?? '—'}</div>
        </div>
      ))}
    </div>
  );
}

const GALLERY_PHOTOS = [
  PHOTOS.kitchenMarbleIsl,
  PHOTOS.kitchenWhite,
  PHOTOS.livingMarble,
  PHOTOS.kitchenModernWood,
  PHOTOS.deck,
  PHOTOS.kitchenWhite,
  PHOTOS.kitchenMarbleIsl,
  PHOTOS.deck,
];

function Gallery({ L }) {
  // Gallery loads either DB-supplied photos (when present) or the studio
  // catalogue as a fallback so a freshly-added listing without a photo set
  // still renders a respectable detail page.
  const photos = (L.gallery && Array.isArray(L.gallery.photos) && L.gallery.photos.length > 0)
    ? L.gallery.photos
    : GALLERY_PHOTOS;
  const tones = (L.gallery && Array.isArray(L.gallery.a) && L.gallery.a.length >= 8)
    ? L.gallery.a
    : ['warm', 'bone', 'cool', 'dusk', 'cool', 'warm', 'dusk', 'cool'];

  return (
    <div style={{ padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4.4vw, 64px) clamp(40px, 6vw, 80px)' }}>
      <div className="tw-gallery-row tw-gallery-1" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <Photo label="" tone={tones[0]} height={'clamp(280px, 36vw, 520px)'} src={photos[0]} />
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 16 }}>
          <Photo label="" tone={tones[1]} height={'clamp(130px, 17.5vw, 252px)'} src={photos[1]} />
          <Photo label="" tone={tones[2]} height={'clamp(130px, 17.5vw, 252px)'} src={photos[2]} />
        </div>
      </div>
      <div className="tw-gallery-row tw-gallery-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
        <Photo label="" tone={tones[3]} height={'clamp(180px, 22vw, 320px)'} src={photos[3]} />
        <Photo label="" tone={tones[4]} height={'clamp(180px, 22vw, 320px)'} src={photos[4]} />
        <Photo label="" tone={tones[5]} height={'clamp(180px, 22vw, 320px)'} src={photos[5]} />
      </div>
      <div className="tw-gallery-row tw-gallery-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, marginTop: 16 }}>
        <Photo label="" tone={tones[6]} height={'clamp(220px, 29vw, 420px)'} src={photos[6]} />
        <Photo label="" tone={tones[7]} height={'clamp(220px, 29vw, 420px)'} src={photos[7]} />
      </div>
    </div>
  );
}

function RelatedRail({ related }) {
  const t = useTheme();
  const isB = t.key === 'B';
  if (!related || related.length === 0) return null;
  return (
    <div style={{ padding: '0 clamp(20px, 4.4vw, 64px) clamp(56px, 8vw, 120px)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 'clamp(24px, 3vw, 40px)', flexWrap: 'wrap', gap: 12,
      }}>
        <h3 style={{
          fontFamily: t.fonts.display, fontWeight: 400,
          fontSize: 'clamp(26px, 3vw, 36px)', margin: 0,
          color: isB ? t.palette.emerald : t.fgPage,
        }}>
          Continue <em style={{ fontStyle: 'italic' }}>through the {t.listingNoun}</em>.
        </h3>
        <Link to="/listings" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: t.eyebrowFont,
            fontSize: 10.5, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.26em' : '0.24em', textTransform: 'uppercase',
            color: isB ? t.palette.emerald : t.fgPage,
            borderBottom: `1px solid ${isB ? t.palette.emerald : t.fgPage}`, paddingBottom: 4,
            cursor: 'pointer',
          }}>View all {t.listingNoun} →</span>
        </Link>
      </div>
      <div className="tw-detail-related" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(20px, 3vw, 32px)',
      }}>
        {related.map(l => (
          <Link key={l.id} to={`/listings/${l.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Photo label="" tone={l.tone} height={'clamp(240px, 28vw, 340px)'} src={l.img} />
            <div style={{ marginTop: 18 }}>
              <div style={{
                fontFamily: t.fonts.display, fontSize: 26,
                color: isB ? t.palette.emerald : t.fgPage,
              }}>{l.addr}</div>
              <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 15, color: t.fgMuted }}>{l.loc}</div>
              <div style={{
                marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.line}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{
                  fontFamily: t.fonts.display, fontSize: 18,
                  color: isB ? t.palette.emerald : t.fgPage,
                }}>{l.price}</span>
                <StatusChip status={l.status} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function DetailStyles() {
  return (
    <style>{`
      @media (max-width: 1000px) {
        .tw-detail-head, .tw-detail-cta {
          grid-template-columns: 1fr !important;
        }
        .tw-detail-offer { text-align: left !important; }
        .tw-detail-offer > div:last-child { justify-content: flex-start !important; }
      }
      @media (max-width: 900px) {
        .tw-detail-specs    { grid-template-columns: 1fr 1fr !important; row-gap: 24px; }
        .tw-detail-specs > div { border-right: none !important; }
        .tw-detail-related  { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .tw-detail-related  { grid-template-columns: 1fr !important; }
        .tw-gallery-1, .tw-gallery-2, .tw-gallery-3 {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function ListingDetail() {
  const t = useTheme();
  const { id } = useParams();
  const { data: dbListing, loading } = useListing(id);

  if (loading) {
    return (
      <div style={{ background: t.bgPage, minHeight: '60vh', display: 'grid', placeItems: 'center', color: t.fgFaint, fontFamily: t.fonts.body, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Loading…
      </div>
    );
  }

  if (!dbListing) return <Navigate to="/listings" replace />;

  // The admin's "Short description" maps to the public tagline subtitle.
  const L = { ...dbListing, tagline: dbListing.tagline || dbListing.blurb || null };
  return t.key === 'B' ? <ListingDetailB L={L} /> : <ListingDetailA L={L} />;
}
