import { Fragment } from 'react';
import { useTheme } from '../theme/DirectionContext';
import Photo from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Eyebrow from '../components/Eyebrow';
import Button from '../components/Button';
import Rule from '../components/Rule';
import { STUDIO } from '../data/listings';
import { ABOUT_STATS, PRINCIPLES, BIOGRAPHY, QUOTES, PRESS, AFFILIATIONS } from '../data/about';

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
          <Eyebrow>About · The Studio</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 300,
            fontSize: 'clamp(48px, 9vw, 120px)', letterSpacing: '-0.025em',
            margin: '24px 0 0', lineHeight: 0.92,
          }}>
            One name.<br /><em style={{ fontStyle: 'italic' }}>One book.</em><br />One coast.
          </h1>
        </div>
        <div style={{ paddingBottom: 12 }}>
          <p style={{
            fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 300,
            fontSize: 'clamp(18px, 2vw, 24px)', lineHeight: 1.5, color: t.fgMuted, margin: 0, maxWidth: 540,
          }}>
            Tawny Walker is a solo broker working a small, hand-chosen book of Michigan property — the kind that benefits from being introduced rather than listed.
          </p>
          <div style={{ marginTop: 32, display: 'flex', gap: 'clamp(16px, 2vw, 24px)', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint }}>License {STUDIO.license}</span>
            <span style={{ width: 1, height: 14, background: t.line }} />
            <span style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint }}>Est. 2012 · Birmingham, MI</span>
          </div>
        </div>
      </div>

      {/* PORTRAIT */}
      <div style={{ padding: '0 clamp(20px, 4.4vw, 64px)' }}>
        <div style={{ position: 'relative' }}>
          <Photo label="PORTRAIT — TAWNY WALKER · STUDIO, OLD WOODWARD AVENUE · APRIL 2026" tone="warm" height={720} />
          <div style={{
            position: 'absolute', bottom: 24, left: 24, padding: '8px 14px',
            background: 'rgba(251,249,245,0.92)',
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 14, color: t.fgPage,
          }}>Photographed by Patrick Lee</div>
        </div>
      </div>

      {/* THE PRACTICE */}
      <div className="tw-about-practice" style={{
        padding: 'clamp(64px, 9vw, 120px) clamp(20px, 4.4vw, 64px)',
        display: 'grid', gridTemplateColumns: '0.8fr 1.4fr', gap: 'clamp(36px, 6vw, 80px)', alignItems: 'start',
      }}>
        <div className="tw-about-sticky">
          <Eyebrow>§ 01 — The practice</Eyebrow>
          <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 52px)', letterSpacing: '-0.018em', margin: '20px 0 0', lineHeight: 1.05 }}>
            A boutique of <em style={{ fontStyle: 'italic' }}>one</em>, by choice.
          </h2>
        </div>
        <div>
          <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 'clamp(20px, 2.2vw, 28px)', lineHeight: 1.45, color: t.fgPage, margin: 0, fontWeight: 400 }}>
            Fourteen years ago I left a larger firm to do what they would not let me do — represent fewer houses, more carefully.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: t.fgMuted, marginTop: 28, fontWeight: 300 }}>
            The studio handles roughly twenty listings each year. I write every description, sit at every showing, and answer every email myself. There is no team, no assistant chain, no junior agent calling back on my behalf. If you reach out, it is me you are speaking to.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: t.fgMuted, marginTop: 18, fontWeight: 300 }}>
            That structure is the practice. It means I cannot represent everyone, but the people I do represent get the same attention I would give a close friend — a clear-eyed read on a property, an honest opinion when something does not work, and the patience to wait for the right buyer or the right house rather than the next one.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: t.fgMuted, marginTop: 18, fontWeight: 300 }}>
            Most of what I work on never reaches a public listing. Sellers prefer it. Buyers benefit from it. And the houses themselves — quietly — tend to find the people who will take care of them next.
          </p>
          <div style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 36, color: t.accent, lineHeight: 1, transform: 'rotate(-4deg)' }}>Tawny W.</span>
            <span style={{ height: 1, flex: 1, minWidth: 12, background: t.line }} />
            <span style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint }}>Principal, Tawny & Co.</span>
          </div>
        </div>
      </div>

      {/* NUMBERS BAR */}
      <div style={{ borderTop: `1px solid ${t.line}`, borderBottom: `1px solid ${t.line}`, padding: 'clamp(40px, 5vw, 64px) clamp(20px, 4.4vw, 64px)', background: t.bgPanel }}>
        <div className="tw-about-numbers" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(20px, 3vw, 48px)' }}>
          {ABOUT_STATS.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 300, fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.02em', color: t.fgPage, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 11.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgPage, marginTop: 14 }}>{s.l}</div>
              <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, color: t.fgMuted, marginTop: 6 }}>{s.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRINCIPLES */}
      <div style={{ padding: 'clamp(64px, 9vw, 120px) clamp(20px, 4.4vw, 64px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(28px, 4vw, 56px)', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <Eyebrow>§ 02 — How the studio works</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 56px)', letterSpacing: '-0.018em', margin: '20px 0 0', lineHeight: 1.05 }}>
              Three <em style={{ fontStyle: 'italic' }}>quiet</em> principles.
            </h2>
          </div>
          <p style={{ maxWidth: 380, fontSize: 14.5, lineHeight: 1.6, color: t.fgMuted, margin: 0 }}>
            What I will and will not do — written down so we both know.
          </p>
        </div>
        <div className="tw-about-principles" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: t.line, border: `1px solid ${t.line}` }}>
          {PRINCIPLES.map((p, i) => (
            <div key={i} style={{ background: t.bgPage, padding: 'clamp(28px, 3vw, 40px) clamp(20px, 2.5vw, 32px)', display: 'flex', flexDirection: 'column', minHeight: 280 }}>
              <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 22, color: t.accent, lineHeight: 1 }}>{p.n}</span>
              <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(24px, 2.5vw, 30px)', letterSpacing: '-0.012em', margin: '16px 0 0', lineHeight: 1.1 }}>{p.t}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: t.fgMuted, marginTop: 18, marginBottom: 0, fontWeight: 300 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BIOGRAPHY TIMELINE */}
      <div style={{ background: t.bgPanel, padding: 'clamp(64px, 9vw, 120px) clamp(20px, 4.4vw, 64px)' }}>
        <Eyebrow>§ 03 — A short biography</Eyebrow>
        <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 56px)', letterSpacing: '-0.018em', margin: '20px 0 56px', lineHeight: 1.05 }}>
          The <em style={{ fontStyle: 'italic' }}>long</em> way around.
        </h2>
        <div className="tw-about-timeline" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 'clamp(16px, 3vw, 48px)' }}>
          {BIOGRAPHY.map((e, i) => (
            <Fragment key={i}>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(26px, 3vw, 36px)', color: t.accent, lineHeight: 1, paddingTop: 8, borderTop: `1px solid ${t.line}` }}>{e.y}</div>
              <div style={{ paddingTop: 8, borderTop: `1px solid ${t.line}` }}>
                <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(20px, 2vw, 26px)', letterSpacing: '-0.012em', margin: 0 }}>{e.h}</h3>
              </div>
              <div style={{ paddingTop: 8, borderTop: `1px solid ${t.line}`, paddingBottom: 24 }}>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: t.fgMuted, margin: 0, fontWeight: 300 }}>{e.b}</p>
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* IN HER WORDS */}
      <div style={{ padding: 'clamp(64px, 9vw, 120px) clamp(20px, 4.4vw, 64px)' }}>
        <Eyebrow>§ 04 — In her words</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(28px, 4vw, 56px)', marginTop: 'clamp(28px, 4vw, 56px)' }}>
          {QUOTES.map((q, i) => (
            <div key={i} style={{ paddingTop: 24, borderTop: `1px solid ${t.line}` }}>
              <div style={{ fontFamily: t.fonts.display, fontSize: 48, color: t.accent, lineHeight: 0.5, marginBottom: 24 }}>“</div>
              <blockquote style={{ margin: 0, fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(18px, 1.8vw, 24px)', lineHeight: 1.4, color: t.fgPage }}>{q}</blockquote>
            </div>
          ))}
        </div>
      </div>

      {/* PRESS + AFFILIATIONS */}
      <div className="tw-about-press" style={{ padding: '0 clamp(20px, 4.4vw, 64px) clamp(64px, 9vw, 120px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 80px)' }}>
        <div>
          <Eyebrow>§ 05 — Press</Eyebrow>
          <div style={{ marginTop: 28 }}>
            {PRESS.map((it, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '90px 1fr 40px', gap: 'clamp(12px, 2vw, 24px)', alignItems: 'baseline',
                padding: '18px 0', borderTop: `1px solid ${t.line}`,
                borderBottom: i === PRESS.length - 1 ? `1px solid ${t.line}` : 'none',
              }}>
                <span style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint }}>{it.y}</span>
                <div>
                  <div style={{ fontFamily: t.fonts.display, fontSize: 19, lineHeight: 1.3, color: t.fgPage }}>{it.t}</div>
                  <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, color: t.fgMuted, marginTop: 4 }}>{it.p}</div>
                </div>
                <span style={{ fontSize: 14, color: t.accent, textAlign: 'right' }}>↗</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Eyebrow>§ 06 — Affiliations</Eyebrow>
          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {AFFILIATIONS.map((it, i) => (
              <div key={i} style={{
                padding: '20px 0', borderTop: `1px solid ${t.line}`,
                fontFamily: t.fonts.display, fontSize: 17, color: t.fgPage, lineHeight: 1.4,
                borderBottom: i >= AFFILIATIONS.length - 2 ? `1px solid ${t.line}` : 'none',
              }}>{it}</div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA — inquiry */}
      <div style={{
        background: t.bgDark, color: t.palette.bone,
        padding: 'clamp(56px, 8.3vw, 120px) clamp(20px, 4.4vw, 64px)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'clamp(32px, 6.7vw, 96px)', alignItems: 'center',
      }}>
        <div>
          <Eyebrow color="rgba(255,255,255,0.6)">§ 07 — A conversation</Eyebrow>
          <h2 style={{ fontFamily: t.fonts.display, fontWeight: 300, fontSize: 'clamp(40px, 5.8vw, 84px)', letterSpacing: '-0.022em', margin: '20px 0 0', lineHeight: 0.95 }}>
            One <em style={{ fontStyle: 'italic' }}>form,</em><br />four paths in.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', maxWidth: 520, marginTop: 32, fontWeight: 300 }}>
            Whether you are buying, selling, investing, or visiting for a season — the studio's intake is the same short form. Tawny answers personally, within one business day.
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
          .tw-about-practice    { grid-template-columns: 1fr !important; }
          .tw-about-sticky      { position: static !important; }
          .tw-about-principles  { grid-template-columns: 1fr !important; gap: 1px; }
          .tw-about-timeline    { grid-template-columns: 90px 1fr !important; }
          .tw-about-timeline > div:nth-child(3n)   { grid-column: 2 / 3; padding-top: 0 !important; border-top: none !important; }
          .tw-about-press       { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .tw-about-numbers     { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── DIRECTION B — Emerald couture ──────────────────────────────────────────
function AboutB() {
  const t = useTheme();
  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <TopNav active="About" />

      {/* MASTHEAD — centered */}
      <div style={{ padding: 'clamp(56px, 7vw, 96px) clamp(20px, 5vw, 72px) clamp(48px, 6vw, 72px)', textAlign: 'center' }}>
        <Eyebrow>About · The Studio</Eyebrow>
        <h1 style={{
          fontFamily: t.fonts.display, fontWeight: 300,
          fontSize: 'clamp(48px, 9vw, 120px)', letterSpacing: '-0.025em',
          margin: '24px auto 0', lineHeight: 0.92, color: t.palette.emerald, maxWidth: 1100,
        }}>
          One name.<br /><em style={{ fontStyle: 'italic' }}>One book.</em><br />One coast.
        </h1>
        <p style={{
          fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(16px, 1.7vw, 22px)', lineHeight: 1.5, color: t.fgMuted, margin: '32px auto 0', maxWidth: 640,
        }}>
          Tawny Walker is a solo broker working a small, hand-chosen book of Michigan property — the kind that benefits from being introduced rather than listed.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}><Rule /></div>
        <div style={{ marginTop: 24, display: 'flex', gap: 'clamp(16px, 2vw, 24px)', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: t.fgFaint }}>License {STUDIO.license}</span>
          <span style={{ width: 1, height: 12, background: t.line }} />
          <span style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase', color: t.fgFaint }}>Est. 2012 · Birmingham, MI</span>
        </div>
      </div>

      {/* PORTRAIT */}
      <div style={{ padding: '0 clamp(20px, 5vw, 72px) clamp(56px, 8vw, 96px)' }}>
        <div style={{ position: 'relative' }}>
          <Photo label="PORTRAIT — TAWNY WALKER · STUDIO, OLD WOODWARD · APRIL 2026" tone="warm" height={720} />
          <div style={{
            position: 'absolute', bottom: 24, left: 24, padding: '8px 14px', background: '#fff',
            fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, color: t.palette.emerald,
          }}>Photographed by Patrick Lee</div>
        </div>
      </div>

      {/* THE PRACTICE */}
      <div className="tw-about-practice" style={{
        padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 72px)',
        background: t.bgPanel,
        display: 'grid', gridTemplateColumns: '0.8fr 1.4fr', gap: 'clamp(36px, 6vw, 80px)', alignItems: 'start',
      }}>
        <div className="tw-about-sticky">
          <Eyebrow>§ 01 — The practice</Eyebrow>
          <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 52px)', letterSpacing: '-0.018em', color: t.palette.emerald, margin: '20px 0 0', lineHeight: 1.05 }}>
            A boutique of <em style={{ fontStyle: 'italic' }}>one,</em> by choice.
          </h2>
        </div>
        <div>
          <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 'clamp(20px, 2.2vw, 26px)', lineHeight: 1.45, color: t.palette.emerald, margin: 0, fontWeight: 400 }}>
            Fourteen years ago I left a larger firm to do what they would not let me do — represent fewer houses, more carefully.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: t.fgMuted, marginTop: 28 }}>
            The studio handles roughly twenty listings each year. I write every description, sit at every showing, and answer every email myself. There is no team, no assistant chain, no junior agent calling back on my behalf. If you reach out, it is me you are speaking to.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: t.fgMuted, marginTop: 18 }}>
            That structure is the practice. It means I cannot represent everyone, but the people I do represent get the same attention I would give a close friend — a clear-eyed read on a property, an honest opinion when something does not work, and the patience to wait for the right buyer or the right house.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: t.fgMuted, marginTop: 18 }}>
            Most of what I work on never reaches a public listing. Sellers prefer it. Buyers benefit from it. And the houses themselves — quietly — tend to find the people who will take care of them next.
          </p>
          <div style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 38, color: t.accent, lineHeight: 1, transform: 'rotate(-4deg)' }}>Tawny W.</span>
            <span style={{ height: 1, flex: 1, minWidth: 12, background: t.line }} />
            <span style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgFaint }}>Principal, Tawny & Co.</span>
          </div>
        </div>
      </div>

      {/* NUMBERS — emerald slab */}
      <div style={{ background: t.palette.emerald, color: '#fff', padding: 'clamp(48px, 6vw, 88px) clamp(20px, 5vw, 72px)' }}>
        <div className="tw-about-numbers" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'clamp(20px, 3vw, 48px)', maxWidth: 1296, margin: '0 auto' }}>
          {ABOUT_STATS.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 300, fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontFamily: t.eyebrowFont, fontSize: 11, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 14, color: t.accentSoft }}>{s.l}</div>
              <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 6 }}>{s.s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRINCIPLES — three cards */}
      <div style={{ padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 72px)', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 1296, margin: '0 auto', marginBottom: 'clamp(32px, 4vw, 56px)', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <Eyebrow>§ 02 — How the studio works</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 56px)', letterSpacing: '-0.018em', color: t.palette.emerald, margin: '20px 0 0', lineHeight: 1.05 }}>
              Three <em style={{ fontStyle: 'italic' }}>quiet</em> principles.
            </h2>
          </div>
          <p style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, color: t.fgMuted, maxWidth: 380, margin: 0 }}>
            What I will and will not do — written down so we both know.
          </p>
        </div>
        <div className="tw-about-principles" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1296, margin: '0 auto' }}>
          {PRINCIPLES.map((p, i) => (
            <div key={i} style={{ background: t.bgPanel, border: `1px solid ${t.line}`, padding: 'clamp(28px, 3vw, 40px) clamp(24px, 2.7vw, 36px)', minHeight: 320 }}>
              <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 22, color: t.accent, lineHeight: 1 }}>{p.n}</span>
              <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(24px, 2.5vw, 30px)', letterSpacing: '-0.012em', color: t.palette.emerald, margin: '16px 0 0', lineHeight: 1.1 }}>{p.t}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: t.fgMuted, marginTop: 18, marginBottom: 0, fontWeight: 400 }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BIOGRAPHY TIMELINE */}
      <div style={{ background: t.bgPanel, padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 72px)' }}>
        <div style={{ maxWidth: 1296, margin: '0 auto' }}>
          <Eyebrow>§ 03 — A short biography</Eyebrow>
          <h2 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(32px, 4.2vw, 56px)', letterSpacing: '-0.018em', color: t.palette.emerald, margin: '20px 0 56px', lineHeight: 1.05 }}>
            The <em style={{ fontStyle: 'italic' }}>long</em> way around.
          </h2>
          <div className="tw-about-timeline" style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 'clamp(16px, 3vw, 48px)' }}>
            {BIOGRAPHY.map((e, i) => (
              <Fragment key={i}>
                <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(26px, 3vw, 36px)', color: t.accent, lineHeight: 1, paddingTop: 8, borderTop: `1px solid ${t.line}` }}>{e.y}</div>
                <div style={{ paddingTop: 8, borderTop: `1px solid ${t.line}` }}>
                  <h3 style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(20px, 2vw, 26px)', letterSpacing: '-0.012em', color: t.palette.emerald, margin: 0 }}>{e.h}</h3>
                </div>
                <div style={{ paddingTop: 8, borderTop: `1px solid ${t.line}`, paddingBottom: 24 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: t.fgMuted, margin: 0 }}>{e.b}</p>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* IN HER WORDS */}
      <div style={{ padding: 'clamp(64px, 9vw, 120px) clamp(20px, 5vw, 72px)', background: '#fff' }}>
        <div style={{ maxWidth: 1296, margin: '0 auto' }}>
          <Eyebrow>§ 04 — In her words</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'clamp(24px, 3vw, 48px)', marginTop: 'clamp(28px, 4vw, 56px)' }}>
            {QUOTES.map((q, i) => (
              <div key={i} style={{ paddingTop: 24, borderTop: `1px solid ${t.line}` }}>
                <div style={{ fontFamily: t.fonts.display, fontSize: 48, color: t.accent, lineHeight: 0.5, marginBottom: 24 }}>“</div>
                <blockquote style={{ margin: 0, fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(18px, 1.8vw, 24px)', lineHeight: 1.4, color: t.palette.emerald }}>{q}</blockquote>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRESS + AFFILIATIONS */}
      <div style={{ padding: '0 clamp(20px, 5vw, 72px) clamp(64px, 9vw, 120px)', background: '#fff' }}>
        <div className="tw-about-press" style={{ maxWidth: 1296, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px, 5vw, 80px)' }}>
          <div>
            <Eyebrow>§ 05 — Press</Eyebrow>
            <div style={{ marginTop: 28 }}>
              {PRESS.map((it, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '90px 1fr 40px', gap: 'clamp(12px, 2vw, 24px)', alignItems: 'baseline',
                  padding: '18px 0', borderTop: `1px solid ${t.line}`,
                  borderBottom: i === PRESS.length - 1 ? `1px solid ${t.line}` : 'none',
                }}>
                  <span style={{ fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.fgFaint }}>{it.y}</span>
                  <div>
                    <div style={{ fontFamily: t.fonts.display, fontSize: 19, lineHeight: 1.3, color: t.palette.emerald }}>{it.t}</div>
                    <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, color: t.fgMuted, marginTop: 4 }}>{it.p}</div>
                  </div>
                  <span style={{ fontSize: 14, color: t.accent, textAlign: 'right' }}>↗</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Eyebrow>§ 06 — Affiliations</Eyebrow>
            <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {AFFILIATIONS.map((it, i) => (
                <div key={i} style={{
                  padding: '20px 0', borderTop: `1px solid ${t.line}`,
                  borderBottom: i >= AFFILIATIONS.length - 2 ? `1px solid ${t.line}` : 'none',
                  fontFamily: t.fonts.display, fontSize: 17, color: t.palette.emerald, lineHeight: 1.4,
                }}>{it}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA — inquiry */}
      <div style={{ background: t.palette.emerald, color: '#fff', padding: 'clamp(56px, 10vw, 140px) clamp(20px, 5vw, 72px)' }}>
        <div style={{ maxWidth: 1296, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px, 7vw, 96px)', alignItems: 'center' }}>
          <div>
            <Eyebrow color={t.accentSoft}>§ 07 — A conversation</Eyebrow>
            <h2 style={{ fontFamily: t.fonts.display, fontWeight: 300, fontSize: 'clamp(40px, 5.8vw, 84px)', letterSpacing: '-0.022em', margin: '20px 0 0', lineHeight: 0.95 }}>
              One <em style={{ fontStyle: 'italic' }}>form,</em><br />four paths in.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', maxWidth: 540, marginTop: 32, fontWeight: 400 }}>
              Whether you are buying, selling, investing, or visiting for a season — the studio's intake is the same short form. Tawny answers personally, within one business day.
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
          .tw-about-practice    { grid-template-columns: 1fr !important; }
          .tw-about-sticky      { position: static !important; }
          .tw-about-principles  { grid-template-columns: 1fr !important; gap: 16px !important; }
          .tw-about-timeline    { grid-template-columns: 90px 1fr !important; }
          .tw-about-timeline > div:nth-child(3n)   { grid-column: 2 / 3; padding-top: 0 !important; border-top: none !important; }
          .tw-about-press       { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .tw-about-numbers     { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default function About() {
  const t = useTheme();
  return t.key === 'B' ? <AboutB /> : <AboutA />;
}
