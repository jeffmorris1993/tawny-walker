import { Link } from 'react-router-dom';
import { useTheme, useDirection } from '../theme/DirectionContext';
import Photo, { PHOTOS } from '../components/Photo';

const HERO_VIDEO_SRC = '/videos/hero.mp4';
// Still frame shown until the video has enough data to play, so the hero
// doesn't read as a black gap on first paint.
const HERO_VIDEO_POSTER = '/videos/hero-poster.jpg';

const HERO_VIDEO_BG_COLORS = {
  emerald: '#0B3D2E',
  cream: '#F6F2EA',
};

function HeroVideoSection() {
  const t = useTheme();
  const isB = t.key === 'B';
  const { heroVideoBg } = useDirection();
  const frameColor = HERO_VIDEO_BG_COLORS[heroVideoBg] || HERO_VIDEO_BG_COLORS.emerald;
  const isCream = heroVideoBg === 'cream';

  // Below-fold (mobile) layout sits on the frame bg — colors adapt accordingly.
  const belowfoldHeadlineColor = isCream ? t.fgPage : '#fff';
  const belowfoldOutline = isCream ? 'secondary' : 'on-dark-outline';
  const belowfoldPrimary = isCream ? 'primary' : 'on-dark-primary';

  const headlineFs = 'clamp(40px, 6.5vw, 104px)';
  const headlineEmWeight = isB ? 400 : 300;

  return (
    <div style={{ background: frameColor }}>
      <TopNav dark={!isCream} />
      <div style={{ padding: 'clamp(20px, 3vw, 36px) clamp(20px, 4.4vw, 64px) clamp(28px, 4vw, 56px)' }}>
        <div style={{
          position: 'relative', width: '100%',
          aspectRatio: '16 / 9',
          maxHeight: 'calc(100vh - 200px)',
          minHeight: 280,
          overflow: 'hidden',
          background: '#1B1B1A',
        }}>
          <video
            src={HERO_VIDEO_SRC}
            poster={HERO_VIDEO_POSTER}
            autoPlay loop muted playsInline preload="auto"
            aria-label="Hero — Tawny Walker"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'scale(1.18)', transformOrigin: 'center' }}
          />
          <div className="tw-hero-video-overlay" style={{
            position: 'absolute',
            left: 'clamp(20px, 4vw, 56px)',
            right: 'clamp(20px, 4vw, 56px)',
            bottom: 'clamp(20px, 4vw, 56px)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            gap: 'clamp(20px, 3vw, 40px)', flexWrap: 'wrap',
            pointerEvents: 'none',
          }}>
            <h1 style={{
              fontFamily: t.fonts.display, fontWeight: 300,
              fontSize: headlineFs, lineHeight: 0.95,
              letterSpacing: '-0.022em', margin: 0, color: '#fff',
              maxWidth: 720, flex: '1 1 320px',
              textShadow: '0 2px 18px rgba(0,0,0,0.4)',
            }}>
              Real estate, <em style={{ fontStyle: 'italic', fontWeight: headlineEmWeight }}>reimagined.</em>
            </h1>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', flex: '0 0 auto', pointerEvents: 'auto' }}>
              <Button to="/listings" variant="on-dark-outline">View {t.indexNoun}</Button>
              <Button to={SCROLL_TO_INQUIRY} variant="on-dark-primary">{t.ctaPrimary}</Button>
            </div>
          </div>
        </div>
      </div>
      <div className="tw-hero-video-belowfold" style={{
        display: 'none',
        padding: '0 clamp(20px, 4.4vw, 64px) clamp(40px, 7vw, 80px)',
        flexDirection: 'column', gap: 'clamp(20px, 4vw, 32px)',
      }}>
        <h1 style={{
          fontFamily: t.fonts.display, fontWeight: 300,
          fontSize: 'clamp(40px, 11vw, 72px)', lineHeight: 0.98,
          letterSpacing: '-0.022em', margin: 0, color: belowfoldHeadlineColor,
        }}>
          Real estate, <em style={{ fontStyle: 'italic', fontWeight: headlineEmWeight }}>reimagined.</em>
        </h1>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Button to="/listings" variant={belowfoldOutline}>View {t.indexNoun}</Button>
          <Button to={SCROLL_TO_INQUIRY} variant={belowfoldPrimary}>{t.ctaPrimary}</Button>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .tw-hero-video-overlay   { display: none !important; }
          .tw-hero-video-belowfold { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Eyebrow from '../components/Eyebrow';
import StatusChip from '../components/StatusChip';
import Button from '../components/Button';
import Rule from '../components/Rule';
import { PILLARS, STUDIO } from '../data/listings';
import { useListings } from '../lib/queries';
import { InquiryWidget } from './Inquiry';

const SCROLL_TO_INQUIRY = '/#inquiry';

function LandingB() {
  const t = useTheme();
  const { heroMedia } = useDirection();
  const { data: LISTINGS } = useListings();
  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      {/* HERO */}
      {heroMedia === 'video' ? <HeroVideoSection /> : (
        <div style={{ position: 'relative', minHeight: 880, background: t.palette.emerald }}>
          <Photo label="HERO · INTERIOR — BIRMINGHAM" tone="dusk" height={880} src={PHOTOS.livingMarble} style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,42,32,0.95) 0%, rgba(8,42,32,0.88) 35%, rgba(8,42,32,0.85) 60%, rgba(8,42,32,0.97) 100%)' }} />
          <div style={{ position: 'relative', zIndex: 3 }}>
            <TopNav dark={true} />
          </div>
          <div className="tw-hero-content" style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: 'clamp(96px, 12vw, 120px) clamp(20px, 5vw, 72px) clamp(64px, 8vw, 96px)',
            zIndex: 2, textAlign: 'center', color: '#fff',
          }}>
            <h1 style={{
              fontFamily: t.fonts.display, fontWeight: 300,
              fontSize: 'clamp(44px, 9.2vw, 132px)', lineHeight: 0.94, letterSpacing: '-0.024em',
              margin: 0, maxWidth: 1100,
            }}>
              Real estate, <em style={{ fontStyle: 'italic', fontWeight: 400 }}>reimagined.</em>
            </h1>
            <p style={{
              fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(16px, 1.7vw, 22px)', lineHeight: 1.5, maxWidth: 660, margin: '32px auto 0',
              color: 'rgba(255,255,255,0.88)',
            }}>
              Design-driven real estate and renovation, done with intention.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 48, flexWrap: 'wrap' }}>
              <Button to={SCROLL_TO_INQUIRY} variant="on-dark-primary">{t.ctaPrimary}</Button>
              <Button to="/listings" variant="on-dark-outline">View The {t.indexNoun}</Button>
            </div>
          </div>
          <div className="tw-hero-colophon" style={{
            position: 'absolute', left: 'clamp(20px, 5vw, 72px)', right: 'clamp(20px, 5vw, 72px)', bottom: 36, zIndex: 2,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 500,
            letterSpacing: '0.28em', textTransform: 'uppercase',
          }}>
            <span>Tawny Walker · {STUDIO.brokeredBy}</span>
            <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, letterSpacing: 'normal', textTransform: 'none' }}>Scroll for current work ↓</span>
            <span>Metro Detroit · Birmingham · Bloomfield Hills</span>
          </div>
        </div>
      )}

      {/* INTRO — centered, two columns */}
      <div className="tw-landing-intro" style={{ padding: 'clamp(64px, 11vw, 160px) clamp(20px, 5vw, 72px) 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 80px)' }}>
          <Eyebrow>The practice</Eyebrow>
          <h2 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(34px, 5.2vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.02em',
            color: t.palette.emerald, margin: '24px auto 0', maxWidth: 1020,
          }}>
            Agent. Investor.<br /><em style={{ fontStyle: 'italic' }}>Renovator.</em>
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <Rule />
          </div>
        </div>
        <div className="tw-listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px, 7vw, 96px)', alignItems: 'start', maxWidth: 1180, margin: '0 auto' }}>
          <div className="tw-landing-portrait" style={{ position: 'relative', width: '100%', minHeight: 720, alignSelf: 'stretch', background: '#fff' }}>
            <Photo label="" tone="warm" height="100%" src={PHOTOS.portraitWhite} fit="cover" objectPosition="center top" bg="#fff" />
          </div>
          <div>
            <p style={{
              fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 'clamp(20px, 2.2vw, 26px)',
              lineHeight: 1.45, color: t.palette.emerald, margin: 0, fontWeight: 400,
            }}>
              Tawny Walker is a Michigan real estate professional recognized for an elevated aesthetic and a strategic, design-driven approach to the work, transforming overlooked properties into highly desirable homes.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: t.fgMuted, margin: '28px 0 0' }}>
              Whether representing clients, sourcing investment properties, or overseeing a renovation from concept to completion, Tawny brings refined vision and hands-on expertise to every detail.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: t.fgMuted, margin: '20px 0 0' }}>
              Anchored in Birmingham; active across Metro Detroit. {STUDIO.brokeredBy}.
            </p>
            <div className="tw-stats-row" style={{ marginTop: 'clamp(36px, 5vw, 56px)', paddingTop: 32, borderTop: `1px solid ${t.line}`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(16px, 2vw, 24px)' }}>
              {PILLARS.map(s => (
                <div key={s.h}>
                  <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(18px, 2vw, 22px)', color: t.palette.emerald, lineHeight: 1.15 }}>{s.h}</div>
                  <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 13.5, color: t.fgFaint, marginTop: 6 }}>{s.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EMBEDDED INQUIRY — emerald centerpiece */}
      <div id="inquiry" style={{ background: t.palette.emerald, color: '#fff', padding: 'clamp(56px, 10vw, 140px) clamp(20px, 5vw, 72px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <Eyebrow color={t.accentSoft}>One door, four conversations</Eyebrow>
          <h2 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(34px, 5.5vw, 76px)', lineHeight: 1, letterSpacing: '-0.02em',
            margin: '24px 0 0',
          }}>
            Tell me how I <em style={{ fontStyle: 'italic' }}>can help.</em>
          </h2>
          <p style={{
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 'clamp(16px, 1.5vw, 20px)', lineHeight: 1.5, color: 'rgba(255,255,255,0.78)',
            maxWidth: 620, margin: '28px auto 0',
          }}>
            One short form: buyer, seller, investor, or visiting agent. The intake tailors itself to the kind of conversation you want to have.
          </p>
        </div>

        <div style={{
          maxWidth: 1180, margin: '0 auto', background: '#fff', color: t.fgPage,
          padding: 'clamp(24px, 4vw, 56px) clamp(20px, 4vw, 56px)',
          boxShadow: '0 40px 80px -32px rgba(0,0,0,0.4)',
        }}>
          <InquiryWidget showHeading={false} />
        </div>
      </div>

      {/* FEATURED */}
      <div style={{ background: t.bgPanel, padding: 'clamp(56px, 10vw, 140px) clamp(20px, 5vw, 72px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <Eyebrow>The {t.indexNoun}</Eyebrow>
          <h2 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(34px, 4.7vw, 64px)', lineHeight: 1, letterSpacing: '-0.02em',
            color: t.palette.emerald, margin: '24px 0 0',
          }}>
            A selection of <em style={{ fontStyle: 'italic' }}>current</em> work.
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <Rule />
          </div>
        </div>
        <div className="tw-listings-grid" style={{ maxWidth: 1296, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 'clamp(24px, 3vw, 48px)' }}>
          {LISTINGS[0] && <FeaturedBigB listing={LISTINGS[0]} num="01" />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 3vw, 40px)' }}>
            {LISTINGS[1] && <FeaturedSmallB listing={LISTINGS[1]} />}
            {LISTINGS[2] && <FeaturedSmallB listing={LISTINGS[2]} />}
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 'clamp(40px, 5vw, 64px)' }}>
          <Button to="/listings" variant="secondary">View the Full Index ({LISTINGS.length})</Button>
        </div>
      </div>

      {/* CTA — inquiry-focused */}
      <div style={{ background: t.palette.emerald, color: '#fff', padding: 'clamp(56px, 10vw, 140px) clamp(20px, 5vw, 72px)' }}>
        <div style={{ maxWidth: 1296, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px, 7vw, 96px)', alignItems: 'center' }}>
          <div>
            <Eyebrow color={t.accentSoft}>A conversation</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(40px, 5.8vw, 84px)', lineHeight: 0.98, letterSpacing: '-0.022em', margin: '20px 0 0' }}>
              One <em style={{ fontStyle: 'italic' }}>form,</em><br />four paths in.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(248,245,238,0.78)', maxWidth: 540, marginTop: 32 }}>
              Whether you are buying, selling, investing, or have a property to renovate, the inquiry begins with the same short form. Tawny answers personally, within one business day.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <Button to={SCROLL_TO_INQUIRY} variant="on-dark-primary" full>{t.ctaPrimary}</Button>
            <Button to="/listings" variant="on-dark-outline" full>{t.ctaSecondary}</Button>
            <div style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(248,245,238,0.55)', marginTop: 14, textAlign: 'center' }}>
              Or call · {STUDIO.phone}
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />

      <style>{`
        /* Below the 1180px grid-cap, the 2-col layout squeezes the portrait
           column thin enough that the cover crop chops Tawny's arms off
           (Surface Pro 7 etc). Stack the intro grid to 1 column so the
           portrait gets the full row width — same treatment as the About
           page. Also adds a gap below the credibility row so it doesn't
           sit flush against the emerald inquiry section. */
        @media (max-width: 1200px) {
          .tw-landing-intro .tw-listings-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .tw-landing-portrait {
            min-height: 0 !important;
            aspect-ratio: 1 / 1;
            max-width: 640px;
            margin: 0 auto;
          }
          .tw-landing-portrait img { object-fit: contain !important; object-position: center !important; }
          .tw-landing-intro { padding-bottom: clamp(56px, 7vw, 96px) !important; }
        }
        @media (max-width: 768px) {
          .tw-listings-grid     { grid-template-columns: 1fr !important; }
          .tw-colophon-mid      { display: none !important; }
          .tw-hero-colophon span:first-child + span { display: none; }
          .tw-landing-portrait  { display: none !important; }
          .tw-featured-photo > div:first-child { height: 260px !important; }
        }
        @media (max-width: 700px) {
          .tw-stats-row { grid-template-columns: 1fr !important; gap: 0 !important; }
          .tw-stats-row > * { padding: 22px 0; border-top: 1px solid rgba(0,0,0,0.08); }
          .tw-stats-row > *:first-child { border-top: 0; padding-top: 0; }
          .tw-stats-row > *:last-child  { padding-bottom: 0; }
          .tw-stats-row > * > div:first-child { font-size: 28px !important; line-height: 1.15 !important; }
          .tw-stats-row > * > div:last-child  { font-size: 15px !important; margin-top: 8px !important; }
        }
      `}</style>
    </div>
  );
}

function FeaturedBigB({ listing, num }) {
  const t = useTheme();
  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: '#fff', border: `1px solid ${t.line}` }}>
      <div className="tw-featured-photo" style={{ position: 'relative' }}>
        <Photo label={`${listing.addr.toUpperCase()}`} tone={listing.tone} height={620} src={listing.img} />
        <div style={{ position: 'absolute', top: 20, left: 20, padding: '6px 12px', background: '#fff' }}>
          <StatusChip status={listing.status} />
        </div>
      </div>
      <div style={{ padding: 'clamp(24px, 3vw, 40px)' }}>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 16, color: t.accent }}>№ {num} / The Index</div>
        <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(28px, 3.4vw, 48px)', letterSpacing: '-0.018em', color: t.palette.emerald, margin: '12px 0 0', lineHeight: 1 }}>{listing.addr}</h3>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 20, color: t.fgMuted, marginTop: 6 }}>
          {listing.street}, {listing.loc}
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: t.fgMuted, margin: '20px 0 0' }}>{listing.blurb}</p>
        <div style={{ marginTop: 28, paddingTop: 22, borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(26px, 3vw, 36px)', color: t.palette.emerald }}>{listing.price}</span>
          <span style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', color: t.fgFaint }}>{listing.specs}</span>
        </div>
      </div>
    </Link>
  );
}

function FeaturedSmallB({ listing }) {
  const t = useTheme();
  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: '#fff', border: `1px solid ${t.line}` }}>
      <div className="tw-featured-photo" style={{ position: 'relative' }}>
        <Photo label={listing.addr.toUpperCase()} tone={listing.tone} height={250} src={listing.img} />
        <div style={{ position: 'absolute', top: 14, left: 14, padding: '5px 10px', background: '#fff' }}>
          <StatusChip status={listing.status} />
        </div>
      </div>
      <div style={{ padding: 'clamp(18px, 2vw, 28px)' }}>
        <h4 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 26, letterSpacing: '-0.012em', color: t.palette.emerald, margin: 0, lineHeight: 1.05 }}>{listing.addr}</h4>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 15, color: t.fgMuted, marginTop: 4 }}>{listing.street} · {listing.loc}</div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: t.fgMuted, margin: '14px 0 0' }}>{listing.blurb}</p>
        <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${t.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 22, color: t.palette.emerald }}>{listing.price}</span>
          <span style={{ fontFamily: t.eyebrowFont, fontSize: 9, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint }}>{listing.specs}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Landing() {
  return <LandingB />;
}
