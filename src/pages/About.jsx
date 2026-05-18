import { useTheme } from '../theme/DirectionContext';
import Photo, { PHOTOS } from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Eyebrow from '../components/Eyebrow';
import Button from '../components/Button';
import Rule from '../components/Rule';
import { STUDIO } from '../data/listings';
import { ABOUT_PARAGRAPHS, CREDIBILITY, DISCIPLINES, ANCHORS, ALSO_REPRESENTING } from '../data/about';

const TO_INQUIRY = '/#inquiry';

// ─── DIRECTION A — Warm editorial ───────────────────────────────────────────
function AboutA() {
  const t = useTheme();
  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <TopNav active="About" />

      {/* MASTHEAD */}
      <div style={{
        padding: 'clamp(56px, 7vw, 96px) clamp(20px, 4.4vw, 64px) clamp(48px, 6vw, 80px)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px, 5vw, 80px)', alignItems: 'end',
      }}>
        <div>
          <Eyebrow>About · Tawny Walker</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 300,
            fontSize: 'clamp(56px, 8.5vw, 120px)', letterSpacing: '-0.025em',
            margin: '24px 0 0', lineHeight: 0.92,
          }}>
            Agent.<br />Investor.<br /><em style={{ fontStyle: 'italic' }}>Renovator.</em>
          </h1>
        </div>
        <div style={{ paddingBottom: 12 }}>
          <p style={{
            fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 300,
            fontSize: 'clamp(18px, 2vw, 24px)', lineHeight: 1.5, color: t.fgMuted, margin: 0, maxWidth: 540,
          }}>
            A Michigan real estate professional with an elevated aesthetic and a strategic, design-driven approach — known for transforming overlooked properties into highly desirable homes.
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 'clamp(16px, 2vw, 24px)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint }}>{STUDIO.brokeredBy}</span>
            <span style={{ width: 1, height: 14, background: t.line }} />
            <span style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint }}>Birmingham, MI</span>
          </div>
        </div>
      </div>

      {/* PORTRAIT */}
      <div style={{ padding: '0 clamp(20px, 4.4vw, 64px)', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: 'min(560px, 100%)', aspectRatio: '7 / 8.5',
          position: 'relative', background: t.bgPage,
        }}>
          <Photo label="" tone="warm" height="100%" src={PHOTOS.portraitHeadshot} fit="contain" bg={t.bgPage} />
        </div>
      </div>

      {/* BIOGRAPHY */}
      <div className="tw-about-practice" style={{
        padding: 'clamp(64px, 9vw, 120px) clamp(20px, 4.4vw, 64px)',
        display: 'grid', gridTemplateColumns: '0.8fr 1.4fr', gap: 'clamp(36px, 6vw, 80px)', alignItems: 'start',
      }}>
        <div className="tw-about-sticky">
          <Eyebrow>§ 01 — In her own words</Eyebrow>
          <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 52px)', letterSpacing: '-0.018em', margin: '20px 0 0', lineHeight: 1.05 }}>
            Real estate, with a <em style={{ fontStyle: 'italic' }}>designer's</em> eye.
          </h2>
        </div>
        <div>
          <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 'clamp(20px, 2.2vw, 28px)', lineHeight: 1.45, color: t.fgPage, margin: 0, fontWeight: 400 }}>
            {ABOUT_PARAGRAPHS[0]}
          </p>
          {ABOUT_PARAGRAPHS.slice(1).map((p, i) => (
            <p key={i} style={{ fontSize: 17, lineHeight: 1.7, color: t.fgMuted, marginTop: i === 0 ? 28 : 18, fontWeight: 300 }}>{p}</p>
          ))}

          <div style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 36, color: t.accent, lineHeight: 1, transform: 'rotate(-4deg)' }}>Tawny W.</span>
            <span style={{ height: 1, flex: 1, minWidth: 12, background: t.line }} />
            <span style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint }}>Tawny Walker</span>
          </div>
        </div>
      </div>

      {/* CREDIBILITY BAND */}
      <div style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`, padding: 'clamp(40px, 5vw, 64px) clamp(20px, 4.4vw, 64px)', background: t.bgPanel }}>
        <div className="tw-about-credibility" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(24px, 4vw, 48px)' }}>
          {CREDIBILITY.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.012em', color: t.fgPage, lineHeight: 1.1 }}>
                {s.h}
              </div>
              <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 17, color: t.fgMuted, marginTop: 12, lineHeight: 1.4 }}>
                {s.s}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DISCIPLINES */}
      <div style={{ padding: 'clamp(64px, 9vw, 120px) clamp(20px, 4.4vw, 64px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(28px, 4vw, 56px)', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <Eyebrow>§ 02 — How Tawny works</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 56px)', letterSpacing: '-0.018em', margin: '20px 0 0', lineHeight: 1.05 }}>
              Three <em style={{ fontStyle: 'italic' }}>practiced</em> disciplines.
            </h2>
          </div>
          <p style={{ maxWidth: 380, fontSize: 14.5, lineHeight: 1.6, color: t.fgMuted, margin: 0 }}>
            What makes Tawny's practice different from the next listing agent.
          </p>
        </div>
        <div className="tw-about-disciplines" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: t.line, border: `1px solid ${t.line}` }}>
          {DISCIPLINES.map((p, i) => (
            <div key={i} style={{ background: t.bgPage, padding: 'clamp(28px, 3vw, 40px) clamp(20px, 2.5vw, 32px)', display: 'flex', flexDirection: 'column', minHeight: 320 }}>
              <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 22, color: t.accent, lineHeight: 1 }}>{p.n}</span>
              <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(28px, 3vw, 36px)', letterSpacing: '-0.012em', margin: '14px 0 0', lineHeight: 1.05 }}>{p.t}</h3>
              <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, lineHeight: 1.4, color: t.fgPage, margin: '18px 0 0', fontWeight: 400 }}>{p.lead}</p>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: t.fgMuted, marginTop: 16, marginBottom: 0, fontWeight: 300 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICE AREAS */}
      <div style={{ background: t.bgPanel, padding: 'clamp(64px, 9vw, 120px) clamp(20px, 4.4vw, 64px)', borderTop: `1px solid ${t.line}` }}>
        <div className="tw-about-practice" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.4fr', gap: 'clamp(36px, 6vw, 80px)', alignItems: 'start' }}>
          <div>
            <Eyebrow>§ 03 — Where Tawny works</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 52px)', letterSpacing: '-0.018em', margin: '20px 0 0', lineHeight: 1.05 }}>
              Metro <em style={{ fontStyle: 'italic' }}>Detroit.</em>
            </h2>
            <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 'clamp(17px, 1.7vw, 19px)', color: t.fgMuted, marginTop: 24, lineHeight: 1.5, fontWeight: 300 }}>
              Anchored in Birmingham and Bloomfield Hills, with active work throughout the surrounding communities.
            </p>
          </div>
          <div>
            <Eyebrow color={t.accent}>— Anchored in</Eyebrow>
            <div className="tw-about-anchors" style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {ANCHORS.map((c, i) => (
                <div key={c} style={{
                  paddingTop: 18, paddingBottom: 32,
                  borderTop: `1px solid ${t.line}`,
                  borderRight: i === 0 ? `1px solid ${t.line}` : 'none',
                  paddingLeft: i === 1 ? 36 : 0,
                  paddingRight: i === 0 ? 36 : 0,
                }}>
                  <div style={{ fontFamily: t.fonts.display, fontWeight: 300, fontSize: 'clamp(36px, 4vw, 56px)', letterSpacing: '-0.018em', lineHeight: 1 }}>
                    {c}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 48 }}>
              <Eyebrow color={t.accent}>— Also representing</Eyebrow>
              <div className="tw-about-also" style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {ALSO_REPRESENTING.map((c, i) => (
                  <div key={c} style={{
                    padding: '20px 0',
                    borderTop: `1px solid ${t.line}`,
                    borderBottom: i >= ALSO_REPRESENTING.length - 3 ? `1px solid ${t.line}` : 'none',
                    paddingLeft: i % 3 === 0 ? 0 : 24,
                    fontFamily: t.fonts.display, fontSize: 'clamp(18px, 2vw, 24px)', color: t.fgPage, lineHeight: 1.3,
                  }}>{c}</div>
                ))}
              </div>
              <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 16, color: t.fgMuted, marginTop: 18, lineHeight: 1.5 }}>
                — and surrounding areas, on request.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PULL QUOTE */}
      <div style={{ padding: 'clamp(72px, 11vw, 140px) clamp(20px, 4.4vw, 64px)', textAlign: 'center' }}>
        <Eyebrow>§ 04</Eyebrow>
        <div style={{ fontFamily: t.fonts.display, fontSize: 64, color: t.accent, lineHeight: 0.5, marginTop: 32 }}>“</div>
        <blockquote style={{
          margin: '24px auto 0', maxWidth: 1000,
          fontFamily: t.fonts.display, fontWeight: 300, fontStyle: 'italic',
          fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.1, color: t.fgPage, letterSpacing: '-0.02em',
        }}>
          More than an agent.<br />
          <span style={{ color: t.accent }}>A network.</span>
        </blockquote>
        <div style={{ marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 28, height: 1, background: t.fgMuted }} />
          <span style={{ fontSize: 10.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgMuted }}>Tawny Walker</span>
          <span style={{ width: 28, height: 1, background: t.fgMuted }} />
        </div>
      </div>

      {/* CTA */}
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
            Whether you are buying, selling, investing, or have a property to renovate — the inquiry begins with the same short form. Tawny answers personally, within one business day.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Button to={TO_INQUIRY} variant="on-dark-primary" full>{t.ctaPrimary}</Button>
          <Button to="/listings" variant="on-dark-outline" full>{t.ctaSecondary}</Button>
          <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 12, textAlign: 'center' }}>
            Or call · {STUDIO.phone}
          </div>
        </div>
      </div>

      <SiteFooter />

      <style>{`
        @media (max-width: 900px) {
          .tw-about-practice     { grid-template-columns: 1fr !important; }
          .tw-about-sticky       { position: static !important; }
          .tw-about-disciplines  { grid-template-columns: 1fr !important; gap: 1px; }
        }
        @media (max-width: 540px) {
          .tw-about-credibility  { grid-template-columns: 1fr !important; }
          .tw-about-also         { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── DIRECTION B — Emerald couture ──────────────────────────────────────────
function AboutB() {
  const t = useTheme();
  const emerald = t.palette.emerald;
  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <TopNav active="About" />

      {/* MASTHEAD — centered */}
      <div style={{ padding: 'clamp(56px, 7vw, 96px) clamp(20px, 5vw, 72px) clamp(48px, 6vw, 72px)', textAlign: 'center' }}>
        <Eyebrow>About · Tawny Walker</Eyebrow>
        <h1 style={{
          fontFamily: t.fonts.display, fontWeight: 300,
          fontSize: 'clamp(56px, 8.5vw, 120px)', letterSpacing: '-0.025em',
          margin: '24px auto 0', lineHeight: 0.92, color: emerald, maxWidth: 1100,
        }}>
          Agent. Investor.<br /><em style={{ fontStyle: 'italic' }}>Renovator.</em>
        </h1>
        <p style={{
          fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(17px, 1.8vw, 22px)', lineHeight: 1.5, color: t.fgMuted, margin: '32px auto 0', maxWidth: 720,
        }}>
          A Michigan real estate professional with an elevated aesthetic and a strategic, design-driven approach — known for transforming overlooked properties into highly desirable homes.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}><Rule /></div>
        <div style={{ marginTop: 24, display: 'flex', gap: 'clamp(16px, 2vw, 24px)', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: t.fgFaint }}>{STUDIO.brokeredBy}</span>
          <span style={{ width: 1, height: 12, background: t.line }} />
          <span style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: t.fgFaint }}>Birmingham, MI</span>
        </div>
      </div>

      {/* PORTRAIT */}
      <div style={{ padding: '0 clamp(20px, 5vw, 72px)' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 640, aspectRatio: '1 / 1', margin: '0 auto', background: '#fff' }}>
          <Photo label="" tone="bloom" height="100%" src={PHOTOS.portraitWhite} fit="contain" bg="#fff" />
        </div>
      </div>

      {/* BIOGRAPHY */}
      <div className="tw-about-practice" style={{
        padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 72px)',
        background: t.bgPanel,
        display: 'grid', gridTemplateColumns: '0.8fr 1.4fr', gap: 'clamp(36px, 6vw, 80px)', alignItems: 'start',
      }}>
        <div className="tw-about-sticky">
          <Eyebrow>§ 01 — In her own words</Eyebrow>
          <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 52px)', letterSpacing: '-0.018em', color: emerald, margin: '20px 0 0', lineHeight: 1.05 }}>
            Real estate, with a <em style={{ fontStyle: 'italic' }}>designer's</em> eye.
          </h2>
        </div>
        <div>
          <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 'clamp(20px, 2.2vw, 26px)', lineHeight: 1.45, color: emerald, margin: 0, fontWeight: 400 }}>
            {ABOUT_PARAGRAPHS[0]}
          </p>
          {ABOUT_PARAGRAPHS.slice(1).map((p, i) => (
            <p key={i} style={{ fontSize: 16, lineHeight: 1.75, color: t.fgMuted, marginTop: i === 0 ? 28 : 18 }}>{p}</p>
          ))}
          <div style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 38, color: t.accent, lineHeight: 1, transform: 'rotate(-4deg)' }}>Tawny W.</span>
            <span style={{ height: 1, flex: 1, minWidth: 12, background: t.line }} />
            <span style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgFaint }}>Tawny Walker</span>
          </div>
        </div>
      </div>

      {/* CREDIBILITY — emerald slab */}
      <div style={{ background: emerald, color: '#FFFFFF', padding: 'clamp(48px, 6vw, 88px) clamp(20px, 5vw, 72px)' }}>
        <div className="tw-about-credibility" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(24px, 4vw, 48px)', maxWidth: 1296, margin: '0 auto' }}>
          {CREDIBILITY.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(26px, 3vw, 38px)', letterSpacing: '-0.012em', lineHeight: 1.15 }}>{s.h}</div>
              <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 17, color: 'rgba(255,255,255,0.78)', marginTop: 12, lineHeight: 1.4 }}>{s.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DISCIPLINES */}
      <div style={{ padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 72px)', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 1296, margin: '0 auto', marginBottom: 'clamp(32px, 4vw, 56px)', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <Eyebrow>§ 02 — How Tawny works</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 56px)', letterSpacing: '-0.018em', color: emerald, margin: '20px 0 0', lineHeight: 1.05 }}>
              Three <em style={{ fontStyle: 'italic' }}>practiced</em> disciplines.
            </h2>
          </div>
          <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, color: t.fgMuted, maxWidth: 380, margin: 0 }}>
            What makes Tawny's practice different from the next listing agent.
          </p>
        </div>
        <div className="tw-about-disciplines" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1296, margin: '0 auto' }}>
          {DISCIPLINES.map((p, i) => (
            <div key={i} style={{ background: t.bgPanel, border: `1px solid ${t.line}`, padding: 'clamp(28px, 3vw, 40px) clamp(24px, 2.7vw, 36px)', minHeight: 340 }}>
              <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 22, color: t.accent, lineHeight: 1 }}>{p.n}</span>
              <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(28px, 3vw, 36px)', letterSpacing: '-0.012em', color: emerald, margin: '14px 0 0', lineHeight: 1.05 }}>{p.t}</h3>
              <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, lineHeight: 1.4, color: emerald, margin: '18px 0 0' }}>{p.lead}</p>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: t.fgMuted, marginTop: 16, marginBottom: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICE AREAS */}
      <div style={{ background: t.bgPanel, padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 72px)' }}>
        <div className="tw-about-practice" style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.4fr', gap: 'clamp(36px, 6vw, 80px)', alignItems: 'start', maxWidth: 1296, margin: '0 auto' }}>
          <div>
            <Eyebrow>§ 03 — Where Tawny works</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 52px)', letterSpacing: '-0.018em', color: emerald, margin: '20px 0 0', lineHeight: 1.05 }}>
              Metro <em style={{ fontStyle: 'italic' }}>Detroit.</em>
            </h2>
            <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 'clamp(17px, 1.7vw, 19px)', color: t.fgMuted, marginTop: 24, lineHeight: 1.5 }}>
              Anchored in Birmingham and Bloomfield Hills, with active work throughout the surrounding communities.
            </p>
          </div>
          <div>
            <Eyebrow>— Anchored in</Eyebrow>
            <div className="tw-about-anchors" style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {ANCHORS.map((c, i) => (
                <div key={c} style={{
                  paddingTop: 18, paddingBottom: 32,
                  borderTop: `1px solid ${t.line}`,
                  borderRight: i === 0 ? `1px solid ${t.line}` : 'none',
                  paddingLeft: i === 1 ? 36 : 0,
                  paddingRight: i === 0 ? 36 : 0,
                }}>
                  <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(36px, 4vw, 56px)', letterSpacing: '-0.018em', lineHeight: 1, color: emerald }}>{c}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 48 }}>
              <Eyebrow>— Also representing</Eyebrow>
              <div className="tw-about-also" style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {ALSO_REPRESENTING.map((c, i) => (
                  <div key={c} style={{
                    padding: '20px 0',
                    borderTop: `1px solid ${t.line}`,
                    borderBottom: i >= ALSO_REPRESENTING.length - 3 ? `1px solid ${t.line}` : 'none',
                    paddingLeft: i % 3 === 0 ? 0 : 24,
                    fontFamily: t.fonts.display, fontSize: 'clamp(18px, 2vw, 24px)', color: emerald, lineHeight: 1.3,
                  }}>{c}</div>
                ))}
              </div>
              <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 16, color: t.fgMuted, marginTop: 18, lineHeight: 1.5 }}>
                — and surrounding areas, on request.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PULL QUOTE */}
      <div style={{ padding: 'clamp(72px, 11vw, 140px) clamp(20px, 5vw, 72px)', textAlign: 'center', background: '#fff' }}>
        <Eyebrow>§ 04</Eyebrow>
        <div style={{ fontFamily: t.fonts.display, fontSize: 64, color: t.accent, lineHeight: 0.5, marginTop: 32 }}>“</div>
        <blockquote style={{
          margin: '24px auto 0', maxWidth: 1000,
          fontFamily: t.fonts.display, fontWeight: 300, fontStyle: 'italic',
          fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.1, color: emerald, letterSpacing: '-0.02em',
        }}>
          More than an agent.<br />
          <span style={{ color: t.accent }}>A network.</span>
        </blockquote>
        <div style={{ marginTop: 40, display: 'inline-flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 28, height: 1, background: t.fgMuted }} />
          <span style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: t.fgMuted }}>Tawny Walker</span>
          <span style={{ width: 28, height: 1, background: t.fgMuted }} />
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: emerald, color: '#fff', padding: 'clamp(56px, 10vw, 140px) clamp(20px, 5vw, 72px)' }}>
        <div style={{ maxWidth: 1296, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px, 7vw, 96px)', alignItems: 'center' }}>
          <div>
            <Eyebrow color={t.accentSoft}>§ 05 — A conversation</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(40px, 5.8vw, 84px)', lineHeight: 0.98, letterSpacing: '-0.022em', margin: '20px 0 0' }}>
              One <em style={{ fontStyle: 'italic' }}>form,</em><br />four paths in.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', maxWidth: 540, marginTop: 32 }}>
              Whether you are buying, selling, investing, or have a property to renovate — the inquiry begins with the same short form. Tawny answers personally, within one business day.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <Button to={TO_INQUIRY} variant="on-dark-primary" full>{t.ctaPrimary}</Button>
            <Button to="/listings" variant="on-dark-outline" full>{t.ctaSecondary}</Button>
            <div style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginTop: 14, textAlign: 'center' }}>Or call · {STUDIO.phone}</div>
          </div>
        </div>
      </div>

      <SiteFooter />

      <style>{`
        @media (max-width: 900px) {
          .tw-about-practice     { grid-template-columns: 1fr !important; }
          .tw-about-sticky       { position: static !important; }
          .tw-about-disciplines  { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
        @media (max-width: 540px) {
          .tw-about-credibility  { grid-template-columns: 1fr !important; }
          .tw-about-also         { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function About() {
  const t = useTheme();
  return t.key === 'B' ? <AboutB /> : <AboutA />;
}
