import { Link, useParams, Navigate } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import Photo, { PHOTOS } from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Eyebrow from '../components/Eyebrow';
import StatusChip from '../components/StatusChip';
import Button from '../components/Button';
import { STUDIO } from '../data/listings';
import { getListingDetail, getRelatedListings } from '../data/listingDetails';

// The detail page renders the same content in two visual directions. Shared
// data, shared section order; the per-direction component supplies the
// surface. Helpers below extract patterns used by both.

function splitName(name) {
  const parts = name.split(' ');
  return [parts[0], parts.slice(1).join(' ')];
}

function StoryParagraphs({ paragraphs, dropCapColor, color, sizeProps }) {
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} style={{
          fontFamily: sizeProps.fontFamily,
          fontWeight: 400,
          fontSize: sizeProps.fontSize,
          lineHeight: 1.65,
          color,
          margin: i === 0 ? 0 : '24px 0 0',
        }}>
          {i === 0 ? (
            <>
              <span style={{
                fontFamily: sizeProps.dropCapFamily || sizeProps.fontFamily,
                fontStyle: 'italic',
                fontSize: sizeProps.dropCapSize,
                marginRight: 8,
                color: dropCapColor,
                verticalAlign: 'baseline',
              }}>{p.charAt(0)}</span>
              {p.slice(1)}
            </>
          ) : p}
        </p>
      ))}
    </>
  );
}

// ─── DIRECTION A ────────────────────────────────────────────────────────────
function ListingDetailA({ L }) {
  const t = useTheme();
  const related = getRelatedListings(L.id);

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
        <Photo label={`HERO · ${L.addr.toUpperCase()} · APPROACH`} tone={L.tone} height={'clamp(360px, 50vw, 720px)'} src={L.img || PHOTOS.livingMarble} />
      </div>

      {/* HEAD */}
      <div style={{ padding: 'clamp(40px, 5vw, 64px) clamp(20px, 4.4vw, 64px) 80px' }}>
        <div className="tw-detail-head" style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'clamp(28px, 5vw, 80px)', alignItems: 'flex-end',
        }}>
          <div>
            <Eyebrow>Listing No. {L.number} · {t.statusLabels[L.status] || L.status}</Eyebrow>
            <h1 style={{
              fontFamily: t.fonts.display, fontWeight: 300,
              fontSize: 'clamp(48px, 6.7vw, 96px)', letterSpacing: '-0.022em', lineHeight: 0.95,
              margin: '20px 0 0',
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
              <span style={{ color: t.fgFaint }}>·</span>
              <span style={{
                fontFamily: t.eyebrowFont, fontSize: 10.5,
                letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint,
              }}>Listed {L.listedAt}</span>
            </div>
          </div>
        </div>

        {/* spec row */}
        <SpecRow L={L} />
      </div>

      {/* EDITORIAL DESCRIPTION */}
      <div style={{
        padding: 'clamp(56px, 8vw, 120px) clamp(20px, 4.4vw, 64px)',
        background: t.bgPanel, borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`,
      }}>
        <div className="tw-detail-story" style={{
          display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 'clamp(32px, 8vw, 96px)',
        }}>
          <div>
            <Eyebrow color={t.accent}>— From the studio</Eyebrow>
            <p style={{
              marginTop: 28, fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: 1.25, color: t.fgPage,
              letterSpacing: '-0.005em',
            }}>"{L.tagline}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32 }}>
              <span style={{ width: 28, height: 1, background: t.accent }} />
              <span style={{
                fontFamily: t.eyebrowFont, fontSize: 10.5,
                letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgMuted,
              }}>Tawny Walker · Principal</span>
            </div>
          </div>
          <div>
            <StoryParagraphs
              paragraphs={L.summary}
              dropCapColor={t.accent}
              color={t.fgPage}
              sizeProps={{
                fontFamily: t.fonts.display,
                fontSize: 'clamp(17px, 1.7vw, 20px)',
                dropCapSize: 'clamp(24px, 2.4vw, 28px)',
              }}
            />
          </div>
        </div>
      </div>

      {/* GALLERY */}
      <Gallery tones={L.gallery.a} />

      {/* THE DETAIL */}
      <div style={{
        padding: 'clamp(64px, 8vw, 120px) clamp(20px, 4.4vw, 64px)',
        background: t.bgPanel, borderTop: `1px solid ${t.line}`,
      }}>
        <div className="tw-detail-story" style={{
          display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'clamp(32px, 8vw, 96px)',
        }}>
          <div>
            <Eyebrow color={t.accent}>— The detail</Eyebrow>
            <p style={{
              marginTop: 24, fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 'clamp(18px, 1.8vw, 21px)', color: t.fgMuted, lineHeight: 1.55,
            }}>
              The facts of the house — what the studio has verified, and what was confirmed by inspection.
            </p>
          </div>
          <AttributeList attrs={L.attributes} />
        </div>
      </div>

      {/* LOCATION */}
      <Location L={L} />

      {/* CTA */}
      <div style={{ padding: 'clamp(56px, 5vw, 40px) clamp(20px, 4.4vw, 64px) clamp(56px, 8vw, 120px)' }}>
        <div className="tw-detail-cta" style={{
          padding: 'clamp(40px, 6vw, 80px) clamp(28px, 6vw, 88px)',
          background: t.bgDark, color: t.palette.bone,
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'clamp(28px, 6vw, 80px)', alignItems: 'center',
        }}>
          <div>
            <span style={{
              fontFamily: t.eyebrowFont, fontSize: 11,
              letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(251,249,245,0.6)',
            }}>— Continue</span>
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
              The studio shows {L.addr} by appointment only — typically on weekday mornings, with a courtesy car from the nearest airport if useful.
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
                Inquire about this listing
                <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 24 }}>→</span>
              </span>
            </Link>
            <div style={{
              marginTop: 16,
              fontFamily: t.eyebrowFont, fontSize: 10.5,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'rgba(251,249,245,0.55)', textAlign: 'center',
            }}>Or call the studio — {STUDIO.phone}</div>
          </div>
        </div>
      </div>

      {/* MORE FROM THE INDEX */}
      <RelatedRail related={related} />

      <SiteFooter />
      <DetailStyles />
    </div>
  );
}

// ─── DIRECTION B ────────────────────────────────────────────────────────────
function ListingDetailB({ L }) {
  const t = useTheme();
  const related = getRelatedListings(L.id);
  const emerald = t.palette.emerald;

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <TopNav active="Residences" />

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
        <Photo label={`HERO · ${L.addr.toUpperCase()} · APPROACH`} tone={L.tone} height={'clamp(360px, 50vw, 720px)'} src={L.img || PHOTOS.livingMarble} />
      </div>

      {/* HEAD */}
      <div style={{ padding: 'clamp(40px, 5vw, 64px) clamp(20px, 5vw, 72px) 80px' }}>
        <div className="tw-detail-head" style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'clamp(28px, 5vw, 80px)', alignItems: 'flex-end',
        }}>
          <div>
            <Eyebrow>{t.indexNounSingular} No. {L.number} · {t.statusLabels[L.status] || L.status}</Eyebrow>
            <h1 style={{
              fontFamily: t.fonts.display, fontWeight: 400,
              fontSize: 'clamp(48px, 6.7vw, 96px)', letterSpacing: '-0.022em', lineHeight: 0.95,
              color: emerald, margin: '20px 0 0',
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
              <span style={{ color: t.fgFaint }}>·</span>
              <span style={{
                fontFamily: t.eyebrowFont, fontSize: 9.5, fontWeight: 600,
                letterSpacing: '0.26em', textTransform: 'uppercase', color: t.fgFaint,
              }}>Listed {L.listedAt}</span>
            </div>
          </div>
        </div>

        <SpecRow L={L} />
      </div>

      {/* EDITORIAL — emerald slab */}
      <div style={{ background: emerald, color: '#FFFFFF', padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 72px)' }}>
        <div className="tw-detail-story" style={{
          display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 'clamp(32px, 8vw, 96px)',
        }}>
          <div>
            <div style={{
              fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
              letterSpacing: '0.34em', textTransform: 'uppercase', color: t.palette.gold,
            }}>— From the studio</div>
            <p style={{
              marginTop: 28, fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: 1.25, color: '#FFFFFF',
              letterSpacing: '-0.005em',
            }}>"{L.tagline}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32 }}>
              <span style={{ width: 28, height: 1, background: t.palette.gold }} />
              <span style={{
                fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
                letterSpacing: '0.32em', textTransform: 'uppercase', color: t.palette.goldSoft,
              }}>Tawny Walker · Principal</span>
            </div>
          </div>
          <div>
            <StoryParagraphs
              paragraphs={L.summary}
              dropCapColor={t.palette.gold}
              color={'rgba(255,255,255,0.92)'}
              sizeProps={{
                fontFamily: t.fonts.display,
                fontSize: 'clamp(17px, 1.7vw, 20px)',
                dropCapSize: 'clamp(28px, 2.6vw, 32px)',
                dropCapFamily: '"Cormorant Garamond", serif',
              }}
            />
          </div>
        </div>
      </div>

      {/* GALLERY */}
      <Gallery tones={L.gallery.b} />

      {/* THE DETAIL */}
      <div style={{
        padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 72px)',
        background: t.bgPanel, borderTop: `1px solid ${t.line}`,
      }}>
        <div className="tw-detail-story" style={{
          display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'clamp(32px, 8vw, 96px)',
        }}>
          <div>
            <Eyebrow>— The detail</Eyebrow>
            <p style={{
              marginTop: 24, fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 'clamp(18px, 1.8vw, 21px)', color: t.fgMuted, lineHeight: 1.55,
            }}>
              The facts of the residence — what the studio has verified, and what was confirmed by inspection.
            </p>
          </div>
          <AttributeList attrs={L.attributes} />
        </div>
      </div>

      {/* LOCATION */}
      <Location L={L} />

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
            }}>— Continue</span>
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
              The studio shows {L.addr} by appointment only — typically on weekday mornings, with a courtesy car from the nearest airport if useful.
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
                Inquire about this {t.admin?.attachedNoun || 'residence'}
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 24 }}>→</span>
              </span>
            </Link>
            <div style={{
              marginTop: 16,
              fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 500,
              letterSpacing: '0.24em', textTransform: 'uppercase',
              color: t.palette.goldSoft, textAlign: 'center',
            }}>Or call the studio — {STUDIO.phone}</div>
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
    { l: 'Bedrooms',       v: L.beds },
    { l: 'Baths',          v: L.baths },
    { l: 'Interior',       v: typeof L.sqft === 'string' ? `${L.sqft} sf` : L.sqft },
    { l: 'Lot',            v: L.lot },
    { l: 'Built',          v: L.built },
    { l: 'Last renovated', v: L.renovated },
  ];
  return (
    <div className="tw-detail-specs" style={{
      marginTop: 'clamp(40px, 5vw, 64px)', paddingTop: 32, paddingBottom: 32,
      borderTop: `1px solid ${isB ? t.palette.emerald : t.line}`,
      borderBottom: `1px solid ${t.line}`,
      display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
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

function AttributeList({ attrs }) {
  const t = useTheme();
  const isB = t.key === 'B';
  return (
    <div>
      {attrs.map((r, i) => (
        <div key={i} className="tw-detail-attr-row" style={{
          display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32,
          padding: '20px 0', borderBottom: `1px solid ${t.line}`,
        }}>
          <span style={{
            fontFamily: t.eyebrowFont,
            fontSize: isB ? 10 : 10.5, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.28em' : '0.24em', textTransform: 'uppercase',
            color: t.fgFaint,
          }}>{r.l}</span>
          <span style={{
            fontFamily: t.fonts.display, fontSize: 'clamp(16px, 1.6vw, 20px)',
            color: isB ? t.palette.emerald : t.fgPage, lineHeight: 1.4,
          }}>{r.v}</span>
        </div>
      ))}
    </div>
  );
}

const GALLERY_PHOTOS = [
  PHOTOS.kitchenMarbleIsl, // 02 · Great room
  PHOTOS.kitchenWhite,     // 03 · Kitchen
  PHOTOS.livingMarble,     // 04 · Primary bath
  PHOTOS.kitchenModernWood,// 05 · Dining
  PHOTOS.deck,             // 06 · Shoreline
  PHOTOS.kitchenWhite,     // 07 · Guest wing
  PHOTOS.kitchenMarbleIsl, // 08 · Library
  PHOTOS.deck,             // 09 · Lake from terrace
];

function Gallery({ tones }) {
  const labels = ['02 · GREAT ROOM', '03 · KITCHEN', '04 · PRIMARY BATH', '05 · DINING', '06 · SHORELINE', '07 · GUEST WING', '08 · LIBRARY', '09 · LAKE FROM TERRACE'];
  const t = useTheme();
  const isB = t.key === 'B';
  return (
    <div style={{ padding: 'clamp(64px, 8vw, 120px) clamp(20px, 4.4vw, 64px)' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        marginBottom: 'clamp(24px, 4vw, 48px)', flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <Eyebrow color={t.accent}>The photographs</Eyebrow>
          <h2 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(36px, 4.5vw, 56px)', margin: '14px 0 0',
            letterSpacing: '-0.018em',
            color: isB ? t.palette.emerald : t.fgPage,
          }}>Twenty-one frames.</h2>
        </div>
        <span style={{
          fontFamily: t.eyebrowFont,
          fontSize: 10.5, fontWeight: isB ? 600 : 400,
          letterSpacing: isB ? '0.26em' : '0.24em', textTransform: 'uppercase',
          color: isB ? t.palette.emerald : t.fgPage,
          borderBottom: `1px solid ${isB ? t.palette.emerald : t.fgPage}`, paddingBottom: 4,
          cursor: 'pointer',
        }}>Open full gallery →</span>
      </div>

      <div className="tw-gallery-row tw-gallery-1" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <Photo label={labels[0]} tone={tones[0]} height={'clamp(280px, 36vw, 520px)'} src={GALLERY_PHOTOS[0]} />
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 16 }}>
          <Photo label={labels[1]} tone={tones[1]} height={'clamp(130px, 17.5vw, 252px)'} src={GALLERY_PHOTOS[1]} />
          <Photo label={labels[2]} tone={tones[2]} height={'clamp(130px, 17.5vw, 252px)'} src={GALLERY_PHOTOS[2]} />
        </div>
      </div>
      <div className="tw-gallery-row tw-gallery-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
        <Photo label={labels[3]} tone={tones[3]} height={'clamp(180px, 22vw, 320px)'} src={GALLERY_PHOTOS[3]} />
        <Photo label={labels[4]} tone={tones[4]} height={'clamp(180px, 22vw, 320px)'} src={GALLERY_PHOTOS[4]} />
        <Photo label={labels[5]} tone={tones[5]} height={'clamp(180px, 22vw, 320px)'} src={GALLERY_PHOTOS[5]} />
      </div>
      <div className="tw-gallery-row tw-gallery-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, marginTop: 16 }}>
        <Photo label={labels[6]} tone={tones[6]} height={'clamp(220px, 29vw, 420px)'} src={GALLERY_PHOTOS[6]} />
        <Photo label={labels[7]} tone={tones[7]} height={'clamp(220px, 29vw, 420px)'} src={GALLERY_PHOTOS[7]} />
      </div>
    </div>
  );
}

function Location({ L }) {
  const t = useTheme();
  const isB = t.key === 'B';
  const area = L.area;
  const headlineColor = isB ? t.palette.emerald : t.fgPage;
  const [first, ...rest] = area.name.split(' ');
  const restText = rest.join(' ');
  return (
    <div style={{ padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 72px)' }}>
      <div className="tw-detail-location" style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 56px)', alignItems: 'center',
      }}>
        <div>
          <Eyebrow color={t.accent}>— On the bay</Eyebrow>
          <h2 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(36px, 4.5vw, 56px)', margin: '14px 0 0',
            letterSpacing: '-0.018em', lineHeight: 1.05,
            color: headlineColor,
          }}>
            {first}{restText ? ' ' : ''}{restText && <em style={{ fontStyle: 'italic' }}>{restText}</em>}.
          </h2>
          <p style={{
            fontFamily: t.fonts.display,
            fontStyle: isB ? 'normal' : 'normal',
            fontSize: 'clamp(17px, 1.7vw, 20px)', lineHeight: 1.65,
            color: t.fgMuted, margin: '24px 0 0', maxWidth: 540,
          }}>{area.body}</p>

          <div className="tw-detail-nearby" style={{
            marginTop: 'clamp(28px, 4vw, 40px)',
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(16px, 2vw, 24px)',
          }}>
            {area.nearby.map(r => (
              <div key={r.l} style={{ paddingBottom: 14, borderBottom: `1px solid ${t.line}` }}>
                <div style={{
                  fontFamily: t.eyebrowFont,
                  fontSize: isB ? 9.5 : 10, fontWeight: isB ? 600 : 400,
                  letterSpacing: isB ? '0.28em' : '0.24em', textTransform: 'uppercase',
                  color: isB ? t.palette.gold : t.fgFaint,
                }}>{r.l}</div>
                <div style={{
                  fontFamily: t.fonts.display, fontSize: 26,
                  color: headlineColor, marginTop: 4,
                }}>{r.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* abstract map */}
        <div className="tw-detail-map" style={{
          position: 'relative', height: 'clamp(320px, 36vw, 520px)',
          background: t.bgPanel, border: `1px solid ${t.line}`,
        }}>
          <div style={{
            position: 'absolute', inset: 0, opacity: isB ? 0.7 : 0.65,
            background: isB
              ? 'linear-gradient(165deg, #D8DED2 0%, #A8B5A3 38%, #7CB1A6 39%, #4C8C8A 100%)'
              : 'linear-gradient(165deg, #DAD0BB 0%, #BFB497 38%, #A4DDE0 39%, #88C8CD 100%)',
          }} />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <path d="M 0 36 Q 22 32 38 40 T 70 38 T 100 44" stroke={isB ? t.palette.emeraldDeep : '#1B1B1A'} strokeWidth="0.25" fill="none" opacity={isB ? 0.5 : 0.45} />
            <path d="M 0 50 Q 30 46 50 50 T 100 56" stroke={isB ? t.palette.emeraldDeep : '#1B1B1A'} strokeWidth="0.15" fill="none" opacity={isB ? 0.3 : 0.25} />
          </svg>
          <div style={{ position: 'absolute', top: '46%', left: '38%', transform: 'translate(-50%, -50%)' }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%',
              background: isB ? t.palette.gold : t.accent,
              display: 'inline-block',
              border: `3px solid ${isB ? '#FFFFFF' : t.palette.bone}`,
              boxShadow: `0 0 0 1px ${isB ? t.palette.emerald : t.accent}`,
            }} />
            <div style={{
              position: 'absolute', left: 26, top: 0,
              fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18,
              whiteSpace: 'nowrap', color: headlineColor,
            }}>{L.addr}</div>
            <div style={{
              position: 'absolute', left: 26, top: 22,
              fontFamily: t.eyebrowFont,
              fontSize: isB ? 9 : 9.5, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.26em' : '0.24em', textTransform: 'uppercase',
              whiteSpace: 'nowrap', color: t.fgFaint,
            }}>{area.coords}</div>
          </div>
          <div style={{
            position: 'absolute', left: 18, bottom: 14,
            fontFamily: t.eyebrowFont,
            fontSize: 9, fontWeight: isB ? 600 : 400,
            letterSpacing: isB ? '0.26em' : '0.24em', textTransform: 'uppercase',
            color: isB ? t.palette.ink : t.fgMuted,
          }}>◌ {area.waterLabel.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}

function RelatedRail({ related }) {
  const t = useTheme();
  const isB = t.key === 'B';
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
          }}>All nine {t.listingNoun} →</span>
        </Link>
      </div>
      <div className="tw-detail-related" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(20px, 3vw, 32px)',
      }}>
        {related.map((l, i) => (
          <Link key={l.id} to={`/listings/${l.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Photo label={l.addr.toUpperCase()} tone={l.tone} height={'clamp(240px, 28vw, 340px)'} src={l.img} />
            <div style={{ marginTop: 18 }}>
              <Eyebrow color={t.accent}>№ {String(i + 1).padStart(2, '0')}</Eyebrow>
              <div style={{
                fontFamily: t.fonts.display, fontSize: 26, marginTop: 6,
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
        .tw-detail-head, .tw-detail-story, .tw-detail-location, .tw-detail-cta {
          grid-template-columns: 1fr !important;
        }
        .tw-detail-offer { text-align: left !important; }
        .tw-detail-offer > div:last-child { justify-content: flex-start !important; }
      }
      @media (max-width: 900px) {
        .tw-detail-attr-row { grid-template-columns: 1fr !important; gap: 4px !important; }
        .tw-detail-specs    { grid-template-columns: repeat(3, 1fr) !important; row-gap: 24px; }
        .tw-detail-specs > div:nth-child(3n) { border-right: none !important; }
        .tw-detail-related  { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 600px) {
        .tw-detail-specs    { grid-template-columns: 1fr 1fr !important; }
        .tw-detail-specs > div { border-right: none !important; }
        .tw-detail-nearby   { grid-template-columns: 1fr !important; }
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
  const L = getListingDetail(id);
  if (!L) return <Navigate to="/listings" replace />;
  return t.key === 'B' ? <ListingDetailB L={L} /> : <ListingDetailA L={L} />;
}
