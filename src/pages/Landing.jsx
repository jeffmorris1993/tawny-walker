import { Link } from 'react-router-dom';
import { TW } from '../tokens';
import Photo from '../components/Photo';
import Wordmark from '../components/Wordmark';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Eyebrow from '../components/Eyebrow';
import StatusChip from '../components/StatusChip';

function FeaturedListingBig() {
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <Photo label="01 — MERIDIAN HOUSE · KEY BISCAYNE" tone="dusk" height={620} />
        <div style={{ position: 'absolute', top: 20, left: 20, padding: '6px 12px', background: 'rgba(251,249,245,0.95)' }}>
          <StatusChip status="Active" />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: TW.bronze }}>01 / Featured</div>
          <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 44, letterSpacing: '-0.018em', margin: '8px 0 0' }}>Meridian House</h3>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 20, color: TW.ink2, marginTop: 4 }}>
            411 Mashta Drive, Key Biscayne FL
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 36 }}>$14,750,000</div>
          <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginTop: 4 }}>
            6 BD · 7.5 BA · 8,200 SF · 1.1 AC
          </div>
        </div>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.65, color: TW.ink2, maxWidth: 620, marginTop: 18, fontWeight: 300 }}>
        A 2019 commission by Sebastián Jaramillo — three pavilions arranged around a courtyard, a private dock, and a saltwater pool that runs the length of the lot.
      </p>
    </div>
  );
}

function FeaturedListingSmall({ tone, status, addr, loc, price, specs, blurb }) {
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <Photo label={addr.toUpperCase()} tone={tone} height={260} />
        <div style={{ position: 'absolute', top: 14, left: 14, padding: '5px 10px', background: 'rgba(251,249,245,0.95)' }}>
          <StatusChip status={status} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 18, gap: 12 }}>
        <div>
          <h4 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 26, letterSpacing: '-0.012em', margin: 0 }}>{addr}</h4>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 16, color: TW.ink2, marginTop: 2 }}>{loc}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22 }}>{price}</div>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginTop: 3 }}>{specs}</div>
        </div>
      </div>
      {blurb && <p style={{ fontSize: 13.5, lineHeight: 1.55, color: TW.ink2, marginTop: 12, fontWeight: 300 }}>{blurb}</p>}
    </div>
  );
}

export default function Landing() {
  return (
    <div style={{ background: TW.bone, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: TW.ink }}>
      {/* HERO */}
      <div style={{ position: 'relative', minHeight: 820 }}>
        <Photo label="HERO — OCEANFRONT ESTATE, KEY BISCAYNE, FL · 6400×4267" tone="dusk" height={820} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.0) 60%, rgba(0,0,0,0.65) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <TopNav dark={true} />
        </div>
        <div style={{ position: 'absolute', left: 64, bottom: 100, right: 64, color: '#fff', zIndex: 2 }} className="tw-hero-content">
          <Eyebrow color="rgba(255,255,255,0.78)">An Editorial Approach to South Florida Real Estate</Eyebrow>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(64px, 9.2vw, 132px)', lineHeight: 0.92, letterSpacing: '-0.025em', margin: '32px 0 0', maxWidth: 1100 }}>
            Quiet houses,<br /><em style={{ fontStyle: 'italic', fontWeight: 300 }}>loud</em> intentions.
          </h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 56, flexWrap: 'wrap', gap: 24 }}>
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 22, lineHeight: 1.5, maxWidth: 520, color: 'rgba(255,255,255,0.88)', margin: 0 }}>
              Tawny Walker represents a small portfolio of considered coastal homes — and the equally considered people who live in them.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/listings" style={{ textDecoration: 'none' }}>
                <span style={{ padding: '18px 26px', border: '1px solid rgba(255,255,255,0.6)', color: '#fff', fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase', display: 'block' }}>View Listings →</span>
              </Link>
              <Link to="/inquiry" style={{ textDecoration: 'none' }}>
                <span style={{ padding: '18px 26px', background: '#fff', color: TW.ink, fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase', display: 'block' }}>Start Your Inquiry →</span>
              </Link>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 64, top: 130, color: 'rgba(255,255,255,0.6)', fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', writingMode: 'vertical-rl', transform: 'rotate(180deg)', zIndex: 2 }}>
          Vol. xii — Spring Index
        </div>
      </div>

      {/* INTRO */}
      <div style={{ padding: 'clamp(64px, 9.7vw, 140px) clamp(24px, 4.4vw, 64px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(40px, 6.7vw, 96px)', alignItems: 'start' }}>
        <div>
          <Eyebrow>§ 01 — On the practice</Eyebrow>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(36px, 4.4vw, 64px)', lineHeight: 1.05, letterSpacing: '-0.018em', margin: '24px 0 0' }}>
            A boutique practice, run<br />by <em style={{ fontStyle: 'italic' }}>one person</em>, on purpose.
          </h2>
        </div>
        <div style={{ paddingTop: 16 }}>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: TW.ink2, margin: 0, fontWeight: 300 }}>
            Tawny Walker has spent fourteen years placing families, founders, and second-home buyers into the houses that suit them — from low-key bungalows in Coconut Grove to oceanfront estates along the Atlantic edge of Florida. She works alone, by design, so every client gets the same quiet attention she would give a relative.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.65, color: TW.ink2, margin: '20px 0 0', fontWeight: 300 }}>
            The studio represents roughly twenty listings each year. Most arrive by referral. None are listed twice.
          </p>
          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, paddingTop: 32, borderTop: `1px solid ${TW.line}` }}>
            {[
              { n: '$184M', l: 'Lifetime Volume' },
              { n: '14 yrs', l: 'In Practice' },
              { n: '97%', l: 'Listings — at or above ask' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 36, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginTop: 8 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* UNIFIED ENTRY — Concept B signature section */}
      <div style={{ padding: '0 clamp(24px, 4.4vw, 64px) clamp(64px, 9.7vw, 140px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <Eyebrow>§ 02 — One door, four conversations</Eyebrow>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(32px, 3.9vw, 56px)', letterSpacing: '-0.018em', margin: '20px 0 0', lineHeight: 1.05 }}>
              Tell me how I <em style={{ fontStyle: 'italic' }}>can help.</em>
            </h2>
          </div>
          <p style={{ maxWidth: 420, fontSize: 14.5, lineHeight: 1.6, color: TW.ink2, margin: 0 }}>
            No phone tree, no funnels. One short form that tailors itself to who you are — buyer, seller, investor, or agent. Tawny responds personally within one business day.
          </p>
        </div>

        {/* Dropdown preview frame */}
        <div style={{
          background: TW.paper, border: `1px solid ${TW.line}`, padding: 'clamp(32px, 4.4vw, 64px) clamp(24px, 5.6vw, 80px)',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(32px, 5.6vw, 80px)', alignItems: 'center',
        }}>
          <div>
            <Eyebrow color={TW.bronze}>The intake — one question to start</Eyebrow>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 28, paddingBottom: 22, borderBottom: `2px solid ${TW.ink}` }}>
              <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 48, color: TW.ink3, lineHeight: 1 }}>I am a</span>
              <span style={{ flex: 1, fontFamily: '"Cormorant Garamond", serif', fontSize: 52, color: TW.ink4, lineHeight: 1, letterSpacing: '-0.012em' }}>choose…</span>
              <span style={{ fontSize: 28, color: TW.ink3 }}>▾</span>
            </div>
            <div style={{ marginTop: 16, fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, display: 'flex', justifyContent: 'space-between' }}>
              <span>Required to begin</span>
              <span>4 options</span>
            </div>
            <Link to="/inquiry" style={{ textDecoration: 'none' }}>
              <div style={{ marginTop: 36, display: 'inline-block', padding: '18px 28px', background: TW.ink, color: TW.bone, fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase' }}>
                Start Your Inquiry →
              </div>
            </Link>
          </div>

          <div>
            <Eyebrow color={TW.ink3}>The four paths</Eyebrow>
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column' }}>
              {[
                { n: 'I', t: 'Buyer', s: 'Find a home worth living in.' },
                { n: 'II', t: 'Seller', s: 'List with intention, not urgency.' },
                { n: 'III', t: 'Investor', s: 'Build a portfolio, quietly.' },
                { n: 'IV', t: 'Agent / Renter', s: 'Refer, co-broke, or rent for a season.' },
              ].map((r, i) => (
                <Link key={r.t} to="/inquiry" style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 16, alignItems: 'baseline',
                    padding: '20px 0', borderTop: i === 0 ? `1px solid ${TW.line}` : 'none',
                    borderBottom: `1px solid ${TW.line}`, cursor: 'pointer',
                  }}>
                    <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 18, color: TW.bronze }}>{r.n}.</span>
                    <div>
                      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 24, lineHeight: 1, color: TW.ink }}>{r.t}</div>
                      <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 15, color: TW.ink2, marginTop: 4 }}>{r.s}</div>
                    </div>
                    <span style={{ fontSize: 16, color: TW.bronze }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED LISTINGS */}
      <div style={{ padding: 'clamp(64px, 8.3vw, 120px) clamp(24px, 4.4vw, 64px) clamp(64px, 9.7vw, 140px)', background: TW.paper }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, flexWrap: 'wrap', gap: 20 }}>
          <div>
            <Eyebrow>§ 03 — Spring Index</Eyebrow>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 'clamp(32px, 3.9vw, 56px)', letterSpacing: '-0.018em', margin: '20px 0 0', lineHeight: 1.05 }}>
              A selection of <em style={{ fontStyle: 'italic' }}>current</em> work.
            </h2>
          </div>
          <Link to="/listings" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: TW.ink, borderBottom: `1px solid ${TW.ink}`, paddingBottom: 4 }}>
              View Full Index (12) →
            </span>
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 40 }} className="tw-listings-grid">
          <FeaturedListingBig />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <FeaturedListingSmall tone="warm" status="Active" addr="3201 Sunset Drive" loc="Coral Gables, FL" price="$8,250,000" specs="5 BD · 6 BA · 6,420 SF · 0.74 AC" blurb="A 1948 mission revival, restored last year by Studio Renata. Walled gardens; west-facing pool." />
            <FeaturedListingSmall tone="cool" status="Pending" addr="Penthouse Three" loc="The Marlowe, Miami Beach" price="$12,400,000" specs="4 BD · 5 BA · 4,180 SF · 360° terrace" blurb="The last full-floor unit at The Marlowe, with unbroken views from Government Cut to the inlet." />
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ padding: 'clamp(64px, 9.7vw, 140px) clamp(24px, 4.4vw, 64px)' }}>
        <Eyebrow>§ 04 — Said of the studio</Eyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 64, marginTop: 56 }}>
          {[
            { q: 'Tawny found us a house we did not know existed, in a neighborhood we had not considered, for a price that surprised us. The whole thing took six weeks.', a: 'Lena & Idris Okafor', r: 'Buyers · Coconut Grove' },
            { q: 'She sold our place in eleven days, off-market, to the second person she showed it to. The photography alone was worth the commission.', a: 'David Hsu', r: 'Seller · Surfside' },
            { q: 'I have worked with three of the biggest names in Florida luxury. None of them returned my emails on a Saturday. Tawny does, and she is better.', a: 'Marisol Vega', r: 'Investor · Family Office' },
          ].map((t, i) => (
            <figure key={i} style={{ margin: 0 }}>
              <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 56, color: TW.bronze, lineHeight: 0.5, marginBottom: 18 }}>"</div>
              <blockquote style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 400, fontSize: 22, lineHeight: 1.45, color: TW.ink }}>{t.q}</blockquote>
              <figcaption style={{ marginTop: 24, paddingTop: 18, borderTop: `1px solid ${TW.line}` }}>
                <div style={{ fontSize: 13, color: TW.ink, fontWeight: 500 }}>{t.a}</div>
                <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginTop: 4 }}>{t.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: TW.ink, color: TW.bone, padding: 'clamp(64px, 8.3vw, 120px) clamp(24px, 4.4vw, 64px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(40px, 6.7vw, 96px)', alignItems: 'center' }}>
        <div>
          <Eyebrow color="rgba(255,255,255,0.6)">§ 05 — A consultation</Eyebrow>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(48px, 5.8vw, 84px)', letterSpacing: '-0.022em', margin: '20px 0 0', lineHeight: 0.95 }}>
            Thirty <em style={{ fontStyle: 'italic' }}>quiet</em><br />minutes. No pitch.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', maxWidth: 520, marginTop: 32, fontWeight: 300 }}>
            Tawny holds three consultations a week, by appointment. Bring a question, a property, or a vague idea — she will tell you honestly whether she can help.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Link to="/inquiry" style={{ textDecoration: 'none' }}>
            <span style={{ display: 'block', padding: '20px 28px', background: TW.bone, color: TW.ink, fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase', textAlign: 'center' }}>Start Your Inquiry →</span>
          </Link>
          <Link to="/inquiry" style={{ textDecoration: 'none' }}>
            <span style={{ display: 'block', padding: '20px 28px', border: '1px solid rgba(255,255,255,0.4)', color: TW.bone, fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase', textAlign: 'center' }}>Book a Consultation →</span>
          </Link>
          <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginTop: 12, textAlign: 'center' }}>
            morristechnologies1@gmail.com
          </div>
        </div>
      </div>

      <SiteFooter />

      <style>{`
        @media (max-width: 768px) {
          .tw-hero-content { left: 24px !important; right: 24px !important; bottom: 48px !important; }
          .tw-listings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
