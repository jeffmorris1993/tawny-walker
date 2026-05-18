import { Link } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import Photo from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Eyebrow from '../components/Eyebrow';
import StatusChip from '../components/StatusChip';
import Button from '../components/Button';
import Rule from '../components/Rule';
import { LISTINGS, TESTIMONIALS, STATS, STUDIO } from '../data/listings';
import { InquiryWidget } from './Inquiry';

const SCROLL_TO_INQUIRY = '/#inquiry';

// ─── DIRECTION A — Warm bone/bronze editorial ───────────────────────────────
function LandingA() {
  const t = useTheme();
  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      {/* HERO */}
      <div style={{ position: 'relative', minHeight: 820 }}>
        <Photo label="HERO — LAKEFRONT ESTATE, CHARLEVOIX, MI · 6400×4267" tone="dusk" height={820} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.65) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <TopNav dark={true} />
        </div>
        <div className="tw-hero-content" style={{ position: 'absolute', left: 'clamp(20px, 4.4vw, 64px)', bottom: 'clamp(40px, 6vw, 100px)', right: 'clamp(20px, 4.4vw, 64px)', color: '#fff', zIndex: 2 }}>
          <Eyebrow color="rgba(255,255,255,0.78)">An Editorial Approach to Michigan Real Estate</Eyebrow>
          <h1 style={{ fontFamily: t.fonts.display, fontWeight: 300, fontSize: 'clamp(48px, 9.2vw, 132px)', lineHeight: 0.92, letterSpacing: '-0.025em', margin: '32px 0 0', maxWidth: 1100 }}>
            Quiet houses,<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>loud</em> intentions.
          </h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'clamp(28px, 4vw, 56px)', flexWrap: 'wrap', gap: 24 }}>
            <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(16px, 1.7vw, 22px)', lineHeight: 1.5, maxWidth: 520, color: 'rgba(255,255,255,0.88)', margin: 0 }}>
              Tawny & Co. represents a small portfolio of considered coastal homes — and the equally considered people who live in them.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Button to="/listings" variant="on-dark-outline">View {t.indexNoun}</Button>
              <Button to={SCROLL_TO_INQUIRY} variant="on-dark-primary">{t.ctaPrimary}</Button>
            </div>
          </div>
        </div>
        <div className="tw-hero-vol" style={{ position: 'absolute', left: 64, top: 130, color: 'rgba(255,255,255,0.6)', fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', writingMode: 'vertical-rl', transform: 'rotate(180deg)', zIndex: 2 }}>
          Vol. xii — Spring Index
        </div>
      </div>

      {/* INTRO */}
      <div style={{ padding: 'clamp(56px, 9.7vw, 140px) clamp(20px, 4.4vw, 64px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(36px, 6.7vw, 96px)', alignItems: 'start' }}>
        <div>
          <Eyebrow>§ 01 — On the practice</Eyebrow>
          <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.4vw, 64px)', lineHeight: 1.05, letterSpacing: '-0.018em', margin: '24px 0 0' }}>
            A boutique practice, run<br />by <em style={{ fontStyle: 'italic' }}>one person</em>, on purpose.
          </h2>
        </div>
        <div style={{ paddingTop: 16 }}>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: t.fgMuted, margin: 0, fontWeight: 300 }}>
            Tawny Walker has spent fourteen years placing families, founders, and second-home buyers into the houses that suit them — from low-key bungalows in Ann Arbor to lakefront estates along the eastern lakefronts of Michigan. She works alone, by design, so every client gets the same quiet attention she would give a relative.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: t.fgMuted, margin: '20px 0 0', fontWeight: 300 }}>
            The studio represents roughly twenty {t.listingNoun} each year. Most arrive by referral. None are listed twice.
          </p>
          <div className="tw-stats-row" style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(20px, 2.5vw, 32px)', paddingTop: 32, borderTop: `1px solid ${t.line}` }}>
            {STATS.map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(28px, 3vw, 36px)', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint, marginTop: 8 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EMBEDDED INQUIRY */}
      <div id="inquiry" style={{ padding: '0 clamp(20px, 4.4vw, 64px) clamp(56px, 9.7vw, 140px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(28px, 4vw, 56px)', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <Eyebrow>§ 02 — One door, four conversations</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(28px, 3.9vw, 56px)', letterSpacing: '-0.018em', margin: '20px 0 0', lineHeight: 1.05 }}>
              Tell me how I <em style={{ fontStyle: 'italic' }}>can help.</em>
            </h2>
          </div>
          <p style={{ maxWidth: 420, fontSize: 14.5, lineHeight: 1.6, color: t.fgMuted, margin: 0 }}>
            No phone tree, no funnels. One short form that tailors itself to who you are — buyer, seller, investor, or agent. Tawny responds personally within one business day.
          </p>
        </div>

        <div style={{
          background: t.bgPanel, border: `1px solid ${t.line}`,
          padding: 'clamp(24px, 4vw, 56px) clamp(20px, 4vw, 56px)',
        }}>
          <InquiryWidget showHeading={false} />
        </div>
      </div>

      {/* FEATURED */}
      <div style={{ padding: 'clamp(56px, 8.3vw, 120px) clamp(20px, 4.4vw, 64px) clamp(56px, 9.7vw, 140px)', background: t.bgPanel }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(28px, 4vw, 56px)', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <Eyebrow>§ 03 — Spring Index</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(28px, 3.9vw, 56px)', letterSpacing: '-0.018em', margin: '20px 0 0', lineHeight: 1.05 }}>
              A selection of <em style={{ fontStyle: 'italic' }}>current</em> work.
            </h2>
          </div>
          <Link to="/listings" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgPage, borderBottom: `1px solid ${t.fgPage}`, paddingBottom: 4 }}>
              View Full Index ({LISTINGS.length}) →
            </span>
          </Link>
        </div>
        <div className="tw-listings-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 'clamp(24px, 3vw, 40px)' }}>
          <FeaturedBigA listing={LISTINGS[0]} num="01" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 3vw, 40px)' }}>
            <FeaturedSmallA listing={LISTINGS[1]} />
            <FeaturedSmallA listing={LISTINGS[2]} />
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ padding: 'clamp(56px, 9.7vw, 140px) clamp(20px, 4.4vw, 64px)' }}>
        <Eyebrow>§ 04 — Said of the studio</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(28px, 4vw, 64px)', marginTop: 'clamp(28px, 4vw, 56px)' }}>
          {TESTIMONIALS.map((q, i) => (
            <figure key={i} style={{ margin: 0 }}>
              <div style={{ fontFamily: t.fonts.display, fontSize: 56, color: t.accent, lineHeight: 0.5, marginBottom: 18 }}>“</div>
              <blockquote style={{ margin: 0, fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400, fontSize: 22, lineHeight: 1.45, color: t.fgPage }}>{q.q}</blockquote>
              <figcaption style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${t.line}` }}>
                <div style={{ fontSize: 13, color: t.fgPage, fontWeight: 500 }}>{q.a}</div>
                <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint, marginTop: 4 }}>{q.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* CTA — inquiry-focused */}
      <div style={{
        background: t.bgDark, color: t.palette.bone,
        padding: 'clamp(56px, 8.3vw, 120px) clamp(20px, 4.4vw, 64px)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'clamp(32px, 6.7vw, 96px)', alignItems: 'center',
      }}>
        <div>
          <Eyebrow color="rgba(255,255,255,0.6)">§ 05 — A conversation</Eyebrow>
          <h2 style={{ fontFamily: t.fonts.display, fontWeight: 300, fontSize: 'clamp(40px, 5.8vw, 84px)', letterSpacing: '-0.022em', margin: '20px 0 0', lineHeight: 0.95 }}>
            One <em style={{ fontStyle: 'italic' }}>form,</em><br />four paths in.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', maxWidth: 520, marginTop: 32, fontWeight: 300 }}>
            Whether you are buying, selling, investing, or visiting for a season — the studio's intake is the same short form. Tawny answers personally, within one business day.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Button to={SCROLL_TO_INQUIRY} variant="on-dark-primary" full>{t.ctaPrimary}</Button>
          <Button to="/listings" variant="on-dark-outline" full>{t.ctaSecondary}</Button>
          <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 12, textAlign: 'center' }}>
            Or call · {STUDIO.phone}
          </div>
        </div>
      </div>

      <SiteFooter />

      <style>{`
        @media (max-width: 768px) {
          .tw-hero-vol     { display: none !important; }
          .tw-listings-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .tw-stats-row    { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function FeaturedBigA({ listing, num }) {
  const t = useTheme();
  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{ position: 'relative' }}>
        <Photo label={`${num} — ${listing.addr.toUpperCase()}`} tone={listing.tone} height={620} />
        <div style={{ position: 'absolute', top: 20, left: 20, padding: '6px 12px', background: 'rgba(251,249,245,0.95)' }}>
          <StatusChip status={listing.status} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: t.fonts.display, fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.accent }}>{num} / Featured</div>
          <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 3.5vw, 44px)', letterSpacing: '-0.018em', margin: '8px 0 0' }}>{listing.addr}</h3>
          <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 20, color: t.fgMuted, marginTop: 4 }}>
            {listing.street}, {listing.loc}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(26px, 3vw, 36px)' }}>{listing.price}</div>
          <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint, marginTop: 4 }}>{listing.specs}</div>
        </div>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.65, color: t.fgMuted, maxWidth: 620, marginTop: 18, fontWeight: 300 }}>
        {listing.blurb}
      </p>
    </Link>
  );
}

function FeaturedSmallA({ listing }) {
  const t = useTheme();
  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{ position: 'relative' }}>
        <Photo label={listing.addr.toUpperCase()} tone={listing.tone} height={260} />
        <div style={{ position: 'absolute', top: 14, left: 14, padding: '5px 10px', background: 'rgba(251,249,245,0.95)' }}>
          <StatusChip status={listing.status} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 18, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <h4 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 26, letterSpacing: '-0.012em', margin: 0 }}>{listing.addr}</h4>
          <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 16, color: t.fgMuted, marginTop: 2 }}>{listing.loc}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: t.fonts.display, fontSize: 22 }}>{listing.price}</div>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint, marginTop: 3 }}>{listing.specs}</div>
        </div>
      </div>
      {listing.blurb && <p style={{ fontSize: 13.5, lineHeight: 1.55, color: t.fgMuted, marginTop: 12, fontWeight: 300 }}>{listing.blurb}</p>}
    </Link>
  );
}

// ─── DIRECTION B — Emerald couture ──────────────────────────────────────────
function LandingB() {
  const t = useTheme();
  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      {/* Slim emerald colophon strip */}
      <div style={{
        background: t.palette.emeraldDeep, color: 'rgba(255,255,255,0.85)',
        padding: '12px clamp(20px, 5vw, 72px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        fontFamily: t.eyebrowFont,
        fontSize: 10, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase',
      }}>
        <span>The Spring Index · Volume xii</span>
        <span className="tw-colophon-mid">Private Real Estate · Michigan</span>
        <span>Est. 2012</span>
      </div>

      {/* HERO */}
      <div style={{ position: 'relative', minHeight: 880, background: t.palette.emerald }}>
        <Photo label="HERO — LAKEFRONT ESTATE, CHARLEVOIX, MI" tone="dusk" height={880} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,42,32,0.65) 0%, rgba(8,42,32,0.15) 35%, rgba(8,42,32,0) 60%, rgba(8,42,32,0.85) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <TopNav dark={true} />
        </div>
        <div className="tw-hero-content" style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 'clamp(96px, 12vw, 120px) clamp(20px, 5vw, 72px) clamp(64px, 8vw, 96px)',
          zIndex: 2, textAlign: 'center', color: '#fff',
        }}>
          <Eyebrow color={t.accentSoft}>An Editorial Approach to Michigan Real Estate</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 300,
            fontSize: 'clamp(44px, 9.2vw, 132px)', lineHeight: 0.94, letterSpacing: '-0.024em',
            margin: '36px 0 0', maxWidth: 1100,
          }}>
            Quiet houses, <em style={{ fontStyle: 'italic', fontWeight: 400 }}>loud</em> intentions.
          </h1>
          <p style={{
            fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400,
            fontSize: 'clamp(16px, 1.7vw, 22px)', lineHeight: 1.5, maxWidth: 640, margin: '32px auto 0',
            color: 'rgba(255,255,255,0.88)',
          }}>
            Tawny & Co. represents a small portfolio of considered coastal homes — and the equally considered people who live in them.
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
          <span>§ Tawny Walker, Principal · License {STUDIO.license}</span>
          <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, letterSpacing: 'normal', textTransform: 'none' }}>Scroll for the Spring book ↓</span>
          <span>Birmingham · Charlevoix · Mackinac Island</span>
        </div>
      </div>

      {/* INTRO — centered, two columns */}
      <div style={{ padding: 'clamp(64px, 11vw, 160px) clamp(20px, 5vw, 72px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 80px)' }}>
          <Eyebrow>§ 01 — On the practice</Eyebrow>
          <h2 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(34px, 5.2vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.02em',
            color: t.palette.emerald, margin: '24px auto 0', maxWidth: 1020,
          }}>
            A boutique of <em style={{ fontStyle: 'italic' }}>one,</em><br />by deliberate design.
          </h2>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <Rule />
          </div>
        </div>
        <div className="tw-listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px, 7vw, 96px)', alignItems: 'start', maxWidth: 1180, margin: '0 auto' }}>
          <div><Photo label="PORTRAIT — TAWNY WALKER · STUDIO" tone="warm" height={620} /></div>
          <div style={{ paddingTop: 24 }}>
            <p style={{
              fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 'clamp(20px, 2.2vw, 26px)',
              lineHeight: 1.45, color: t.palette.emerald, margin: 0, fontWeight: 400,
            }}>
              Tawny Walker has spent fourteen years placing families, founders, and second-home buyers into the houses that suit them.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: t.fgMuted, margin: '28px 0 0' }}>
              From low-key bungalows in Ann Arbor to lakefront estates along the eastern lakefronts of Michigan, she works alone — by design — so every client receives the same quiet attention she would give a close relative.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: t.fgMuted, margin: '20px 0 0' }}>
              The studio represents roughly twenty {t.listingNoun} each year. Most arrive by referral. None are listed twice.
            </p>
            <div className="tw-stats-row" style={{ marginTop: 'clamp(36px, 5vw, 56px)', paddingTop: 32, borderTop: `1px solid ${t.line}`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(16px, 2vw, 32px)' }}>
              {STATS.map(s => (
                <div key={s.l}>
                  <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(28px, 3.2vw, 40px)', color: t.palette.emerald, lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontFamily: t.eyebrowFont, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', color: t.fgFaint, marginTop: 10 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* EMBEDDED INQUIRY — emerald centerpiece */}
      <div id="inquiry" style={{ background: t.palette.emerald, color: '#fff', padding: 'clamp(56px, 10vw, 140px) clamp(20px, 5vw, 72px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <Eyebrow color={t.accentSoft}>§ 02 — One door, four conversations</Eyebrow>
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
            One short form — buyer, seller, investor, or visiting agent. The intake tailors itself to the kind of conversation you want to have.
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
          <Eyebrow>§ 03 — Spring {t.indexNoun}</Eyebrow>
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
          <FeaturedBigB listing={LISTINGS[0]} num="01" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 3vw, 40px)' }}>
            <FeaturedSmallB listing={LISTINGS[1]} />
            <FeaturedSmallB listing={LISTINGS[2]} />
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 'clamp(40px, 5vw, 64px)' }}>
          <Button to="/listings" variant="secondary">View the Full Index ({LISTINGS.length})</Button>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ padding: 'clamp(56px, 10vw, 140px) clamp(20px, 5vw, 72px)', background: '#fff', borderTop: `1px solid ${t.line}` }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 64px)' }}>
          <Eyebrow>§ 04 — Said of the studio</Eyebrow>
          <h2 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(32px, 3.9vw, 56px)', lineHeight: 1.05, letterSpacing: '-0.02em',
            color: t.palette.emerald, margin: '20px auto 0',
          }}>
            From those <em style={{ fontStyle: 'italic' }}>quietly</em> served.
          </h2>
        </div>
        <div style={{ maxWidth: 1296, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(20px, 2.5vw, 32px)' }}>
          {TESTIMONIALS.map((q, i) => (
            <figure key={i} style={{ margin: 0, padding: 'clamp(28px, 3vw, 40px) clamp(20px, 2.5vw, 32px)', background: t.bgPanel, border: `1px solid ${t.line}`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: t.fonts.display, fontSize: 64, color: t.accent, lineHeight: 0.5, marginBottom: 24 }}>“</div>
              <blockquote style={{ margin: 0, fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400, fontSize: 21, lineHeight: 1.5, color: t.palette.emerald, flex: 1 }}>{q.q}</blockquote>
              <figcaption style={{ marginTop: 28, paddingTop: 18, borderTop: `1px solid ${t.line}` }}>
                <div style={{ fontFamily: t.eyebrowFont, fontSize: 13, fontWeight: 600, color: t.fgPage }}>{q.a}</div>
                <div style={{ fontFamily: t.eyebrowFont, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgFaint, marginTop: 6 }}>{q.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* CTA — inquiry-focused */}
      <div style={{ background: t.palette.emerald, color: '#fff', padding: 'clamp(56px, 10vw, 140px) clamp(20px, 5vw, 72px)' }}>
        <div style={{ maxWidth: 1296, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px, 7vw, 96px)', alignItems: 'center' }}>
          <div>
            <Eyebrow color={t.accentSoft}>§ 05 — A conversation</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(40px, 5.8vw, 84px)', lineHeight: 0.98, letterSpacing: '-0.022em', margin: '20px 0 0' }}>
              One <em style={{ fontStyle: 'italic' }}>form,</em><br />four paths in.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(248,245,238,0.78)', maxWidth: 540, marginTop: 32 }}>
              Whether you are buying, selling, investing, or visiting for a season — the studio's intake is the same short form. Tawny answers personally, within one business day.
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
        @media (max-width: 768px) {
          .tw-listings-grid     { grid-template-columns: 1fr !important; }
          .tw-colophon-mid      { display: none !important; }
          .tw-hero-colophon span:first-child + span { display: none; }
        }
        @media (max-width: 480px) {
          .tw-stats-row { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function FeaturedBigB({ listing, num }) {
  const t = useTheme();
  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: '#fff', border: `1px solid ${t.line}` }}>
      <div style={{ position: 'relative' }}>
        <Photo label={`${listing.addr.toUpperCase()}`} tone={listing.tone} height={620} />
        <div style={{ position: 'absolute', top: 20, left: 20, padding: '6px 12px', background: '#fff' }}>
          <StatusChip status={listing.status} />
        </div>
      </div>
      <div style={{ padding: 'clamp(24px, 3vw, 40px)' }}>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 16, color: t.accent }}>№ {num} / Spring Index</div>
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
      <div style={{ position: 'relative' }}>
        <Photo label={listing.addr.toUpperCase()} tone={listing.tone} height={250} />
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
  const t = useTheme();
  return t.key === 'B' ? <LandingB /> : <LandingA />;
}
