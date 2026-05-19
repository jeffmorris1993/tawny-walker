import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import { ROLES, ROLE_KEYS } from '../data/inquiryRoles';
import Photo from '../components/Photo';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Eyebrow from '../components/Eyebrow';

// The unified inquiry is identical across directions in behavior — one dropdown
// reveals one of four role-specific forms. The same state machine, role data,
// and section schema power both A and B; only the visual primitives differ.
//
// `<InquiryWidget>` is the standalone interactive form (right-side dropdown +
// role form). It's embedded on the Landing page and used inside the full
// Inquiry page below.
//
// state: 'initial' | 'open' | 'buyer' | 'seller' | 'investor' | 'agent'

export function useInquiryState({ syncUrl = false } = {}) {
  // Always call useSearchParams — React requires unconditional hook calls.
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = syncUrl && ROLE_KEYS.includes(searchParams.get('as'))
    ? searchParams.get('as')
    : 'initial';
  const [state, setState] = useState(initial);

  useEffect(() => {
    if (!syncUrl) return;
    if (ROLE_KEYS.includes(state)) {
      if (searchParams.get('as') !== state) {
        const next = new URLSearchParams(searchParams);
        next.set('as', state);
        setSearchParams(next, { replace: true });
      }
    } else if (searchParams.get('as')) {
      const next = new URLSearchParams(searchParams);
      next.delete('as');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const selectedKey = ROLE_KEYS.includes(state) ? state : null;
  const selected = selectedKey ? ROLES[selectedKey] : null;
  const open = state === 'open';

  return {
    state, setState, selectedKey, selected, open,
    toggleOpen: () => setState(s => (s === 'open' ? (selectedKey || 'initial') : 'open')),
    pick: (k) => setState(k),
    reset: () => setState('initial'),
  };
}

function useInquirySkin() {
  const t = useTheme();
  const isB = t.key === 'B';
  return {
    isB,
    leftBg: isB ? t.palette.emerald : t.bgPanel,
    leftFg: isB ? '#fff' : t.fgPage,
    leftMuted: isB ? 'rgba(255,255,255,0.78)' : t.fgMuted,
    leftLine: isB ? 'rgba(255,255,255,0.18)' : t.line,
    leftAccent: isB ? t.accentSoft : t.accent,
    rightBg: isB ? '#fff' : t.bgPage,
    accentLine: isB ? t.palette.emerald : t.palette.ink,
    headlineColor: isB ? '#fff' : t.fgPage,
    selectionColor: isB ? t.palette.emerald : t.palette.ink,
    selectionFaint: t.palette.ink4,
    arrowColor: isB ? t.palette.emerald : t.fgFaint,
    arrowOpenColor: t.accent,
    cursorColor: t.accent,
    submitBg: isB ? t.palette.emerald : t.palette.ink,
    submitFg: isB ? '#fff' : t.palette.bone,
    chipBg: isB ? t.palette.emerald : t.palette.ink,
    chipFg: isB ? '#fff' : t.palette.bone,
    sliderTrack: t.line,
    sliderEnd: isB ? t.palette.emerald : t.palette.ink,
    sliderMid: t.accent,
    valueColor: isB ? t.palette.emerald : t.fgPage,
    t,
  };
}

// ─── Form pieces ────────────────────────────────────────────────────────────
function FormLabel({ children }) {
  const t = useTheme();
  const isB = t.key === 'B';
  return (
    <div style={{
      fontFamily: t.eyebrowFont,
      fontSize: 10, fontWeight: isB ? 600 : 400,
      letterSpacing: isB ? '0.28em' : '0.22em',
      textTransform: 'uppercase',
      color: t.fgFaint,
    }}>{children}</div>
  );
}

function InputField({ label, value, placeholder, dropdown }) {
  const skin = useInquirySkin();
  const t = skin.t;
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <div style={{
        marginTop: 10, paddingBottom: 10,
        borderBottom: `1px solid ${t.fgMuted}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
      }}>
        <span style={{
          fontFamily: value ? t.fonts.display : t.fonts.body,
          fontStyle: value ? 'italic' : 'normal',
          fontSize: value ? 19 : 14,
          color: value ? skin.valueColor : t.fgFaint,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{value || placeholder}</span>
        {dropdown && <span style={{ color: skin.accentLine, fontSize: 13, flexShrink: 0 }}>▾</span>}
      </div>
    </div>
  );
}

function RoleSection({ s }) {
  const skin = useInquirySkin();
  const t = skin.t;

  if (s.title && s.cols) {
    return (
      <div style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${t.line}` }}>
          <Eyebrow color={t.accent}>{s.title}</Eyebrow>
        </div>
        <div className="tw-form-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {s.cols.map((c, i) => <InputField key={i} {...c} />)}
        </div>
      </div>
    );
  }
  if (s.type === 'pair') {
    return (
      <div className="tw-form-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 24 }}>
        {s.cols.map((c, i) => <InputField key={i} {...c} />)}
      </div>
    );
  }
  if (s.type === 'chips') {
    return (
      <div style={{ marginBottom: 26 }}>
        <FormLabel>{s.label}</FormLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {s.value.map(v => (
            <span key={v} style={{
              padding: '8px 14px', background: skin.chipBg, color: skin.chipFg,
              fontFamily: t.eyebrowFont,
              fontSize: 11, fontWeight: skin.isB ? 600 : 400,
              letterSpacing: skin.isB ? '0.2em' : '0.16em',
              textTransform: 'uppercase',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>{v} <span style={{ opacity: 0.5 }}>×</span></span>
          ))}
          {s.options.map(v => (
            <span key={v} style={{
              padding: '8px 14px', border: `1px solid ${t.line}`,
              fontFamily: t.eyebrowFont,
              fontSize: 11, fontWeight: skin.isB ? 500 : 400,
              letterSpacing: skin.isB ? '0.2em' : '0.16em',
              textTransform: 'uppercase', color: t.fgMuted,
            }}>{v} +</span>
          ))}
        </div>
      </div>
    );
  }
  if (s.type === 'budget') {
    return (
      <div style={{ marginBottom: 32 }}>
        <FormLabel>{s.label}</FormLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: t.fonts.display, fontSize: 28, color: skin.valueColor }}>{s.min}</span>
          <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, color: t.fgFaint }}>to</span>
          <span style={{ fontFamily: t.fonts.display, fontSize: 28, color: skin.valueColor }}>{s.max}</span>
        </div>
        <div style={{ position: 'relative', height: 1, background: skin.sliderTrack, marginTop: 18 }}>
          <span style={{ position: 'absolute', left: 0, top: -4, width: 9, height: 9, background: skin.sliderEnd, borderRadius: '50%' }} />
          <span style={{ position: 'absolute', left: `${(s.center || 0.5) * 100}%`, transform: 'translateX(-50%)', top: -4, width: 9, height: 9, background: skin.sliderMid, borderRadius: '50%' }} />
          <span style={{ position: 'absolute', right: 0, top: -4, width: 9, height: 9, background: skin.sliderEnd, borderRadius: '50%' }} />
        </div>
      </div>
    );
  }
  if (s.type === 'note') {
    return (
      <div style={{ marginBottom: 20 }}>
        <FormLabel>{s.label}</FormLabel>
        <div style={{
          marginTop: 12, padding: '14px 0',
          borderBottom: `1px solid ${t.fgMuted}`,
          fontFamily: t.fonts.display, fontStyle: 'italic',
          fontSize: 18, color: skin.valueColor, lineHeight: 1.55,
        }}>{s.value}</div>
      </div>
    );
  }
  return null;
}

function RoleForm({ role }) {
  const skin = useInquirySkin();
  const t = skin.t;
  return (
    <div style={{ marginTop: 48 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 32, paddingBottom: 16, borderBottom: `1px solid ${t.line}`,
        flexWrap: 'wrap',
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent }} />
        <span style={{
          fontFamily: t.eyebrowFont, fontSize: 10.5,
          fontWeight: skin.isB ? 600 : 400,
          letterSpacing: skin.isB ? '0.28em' : '0.24em',
          textTransform: 'uppercase',
          color: skin.isB ? t.palette.emerald : t.fgMuted,
        }}>Form tailored for a {role.label.toLowerCase()}</span>
        <span style={{ flex: 1, minWidth: 12, height: 1, background: t.line }} />
      </div>
      {role.sections.map((s, i) => <RoleSection key={i} s={s} />)}
    </div>
  );
}

function InteractiveDropdown({ state, selected, onToggle, onPick }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const open = state === 'open';

  return (
    <div style={{ position: 'relative' }}>
      <div onClick={onToggle} style={{
        display: 'flex', alignItems: 'baseline', gap: 'clamp(8px, 2vw, 18px)',
        paddingBottom: 'clamp(16px, 2.5vw, 22px)',
        borderBottom: `2px solid ${skin.accentLine}`,
        cursor: 'pointer', userSelect: 'none',
      }}>
        <span style={{
          fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(22px, 5vw, 56px)', color: t.fgFaint, lineHeight: 1, flexShrink: 0,
        }}>I am a</span>
        <span style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          <span style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(24px, 5.5vw, 60px)',
            color: selected ? skin.selectionColor : skin.selectionFaint,
            lineHeight: 1, letterSpacing: '-0.012em',
            display: 'inline-block', whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
          }}>{selected ? selected.label : (open ? ' ' : 'choose…')}</span>
          {open && (
            <span style={{
              display: 'inline-block', width: 2, height: 'clamp(22px, 4.5vw, 52px)',
              background: skin.cursorColor, marginLeft: 2, verticalAlign: 'middle',
              transform: 'translateY(-4px)', animation: 'twBlink 1s steps(2, start) infinite',
            }} />
          )}
        </span>
        <span style={{
          fontFamily: t.fonts.display, fontSize: 'clamp(18px, 3vw, 32px)',
          color: open ? skin.arrowOpenColor : skin.arrowColor,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s ease', flexShrink: 0,
        }}>▾</span>
      </div>

      <div style={{
        marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: t.eyebrowFont, fontSize: 10.5,
        fontWeight: skin.isB ? 600 : 400,
        letterSpacing: skin.isB ? '0.28em' : '0.24em',
        textTransform: 'uppercase', color: t.fgFaint, gap: 12, flexWrap: 'wrap',
      }}>
        <span>{selected ? selected.sub : 'Required to begin'}</span>
        <span style={{ cursor: 'pointer' }} onClick={onToggle}>{selected ? 'Change selection' : '4 options'}</span>
      </div>

      {open && (
        <div style={{
          marginTop: 16,
          background: skin.rightBg, border: `1px solid ${skin.accentLine}`,
          boxShadow: '0 24px 48px -16px rgba(0,0,0,0.18)',
        }}>
          {ROLE_KEYS.map((k, i) => <DropdownOption key={k} k={k} first={i === 0} onPick={onPick} />)}
        </div>
      )}

      <style>{`@keyframes twBlink { 0%, 50% { opacity: 1 } 50.01%, 100% { opacity: 0 } }`}</style>
    </div>
  );
}

function DropdownOption({ k, first, onPick }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const r = ROLES[k];
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onPick(k)}
      style={{
        display: 'grid', gridTemplateColumns: '40px 1fr auto',
        gap: 16, alignItems: 'center', padding: '20px 18px',
        borderTop: first ? 'none' : `1px solid ${t.line}`,
        background: hover ? t.bgPanel : 'transparent',
        cursor: 'pointer', transition: 'background 0.15s ease',
      }}
    >
      <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 24, color: t.accent, lineHeight: 1 }}>{r.roman}.</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 'clamp(22px, 2.6vw, 28px)', color: skin.selectionColor, lineHeight: 1, letterSpacing: '-0.012em' }}>{r.label}</div>
        <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 15, color: t.fgMuted, marginTop: 6 }}>{r.sub}</div>
      </div>
      <span style={{
        fontFamily: t.eyebrowFont, fontSize: 11,
        fontWeight: skin.isB ? 600 : 400,
        letterSpacing: skin.isB ? '0.28em' : '0.24em',
        textTransform: 'uppercase',
        color: hover ? skin.selectionColor : t.fgFaint,
        whiteSpace: 'nowrap',
      }}>{hover ? 'Select →' : 'Select'}</span>
    </div>
  );
}

function InitialHint({ onPick }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ marginTop: 'clamp(32px, 5vw, 56px)' }}>
      <div className="tw-initial-grid" style={{
        padding: 'clamp(28px, 5vw, 48px) 0', borderBottom: `1px dashed ${t.line}`,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
      }}>
        {ROLE_KEYS.map(k => {
          const r = ROLES[k];
          const isHover = hovered === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onPick && onPick(k)}
              onMouseEnter={() => setHovered(k)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '22px 18px',
                background: isHover ? (skin.isB ? '#fff' : t.bgPage) : t.bgPanel,
                border: `1px solid ${isHover ? skin.accentLine : t.line}`,
                display: 'flex', flexDirection: 'column', minHeight: 168,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit', color: 'inherit',
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}
            >
              <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 18, color: t.accent }}>{r.roman}.</span>
              <div style={{ fontFamily: t.fonts.display, fontWeight: 400, fontSize: 22, color: skin.selectionColor, marginTop: 10, lineHeight: 1.05 }}>{r.label}</div>
              <div style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 14, color: t.fgMuted, marginTop: 6, lineHeight: 1.4, flex: 1 }}>{r.sub}</div>
              <div style={{
                marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: t.eyebrowFont, fontSize: 10,
                fontWeight: skin.isB ? 600 : 400,
                letterSpacing: skin.isB ? '0.26em' : '0.22em',
                textTransform: 'uppercase', color: isHover ? skin.selectionColor : t.fgFaint,
              }}>
                <span>{isHover ? 'Select' : 'Begin'}</span>
                <span style={{ fontSize: 14 }}>→</span>
              </div>
            </button>
          );
        })}
      </div>
      <p style={{ marginTop: 28, fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 17, color: t.fgFaint, lineHeight: 1.55, maxWidth: 540 }}>
        Choose a path above, by tile or by dropdown. The form below tailors itself to what you select.
      </p>
    </div>
  );
}

// The menu is rendered inline (not absolutely positioned), so no placeholder
// space is needed below it — the container grows naturally around the menu.
function DropdownOpenBody() {
  return null;
}

// ─── The embeddable widget ──────────────────────────────────────────────────
// Use on the landing page or anywhere else. Handles its own state.
export function InquiryWidget({ syncUrl = false, showHeading = true }) {
  const skin = useInquirySkin();
  const t = skin.t;
  const inq = useInquiryState({ syncUrl });
  const { state, selected, open, toggleOpen, pick } = inq;

  return (
    <div id="inquiry">
      {showHeading && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, flexWrap: 'wrap', gap: 12 }}>
          <Eyebrow>Intake · One form, four paths</Eyebrow>
          <div style={{
            fontFamily: t.eyebrowFont, fontSize: 10.5,
            fontWeight: skin.isB ? 600 : 400,
            letterSpacing: skin.isB ? '0.28em' : '0.22em',
            textTransform: 'uppercase', color: t.fgFaint,
          }}>
            {selected ? `${selected.roman} · ${selected.label.toUpperCase()}` : 'AWAITING SELECTION'}
          </div>
        </div>
      )}

      <InteractiveDropdown state={state} selected={selected} onToggle={toggleOpen} onPick={pick} />

      {!selected && !open && <InitialHint onPick={pick} />}
      {open && <DropdownOpenBody />}
      {selected && !open && <RoleForm role={selected} />}

      {selected && !open && (
        <div style={{
          marginTop: 48, paddingTop: 28, borderTop: `1px solid ${t.line}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 24, flexWrap: 'wrap',
        }}>
          <p style={{ fontSize: 12, color: t.fgFaint, maxWidth: 380, margin: 0, lineHeight: 1.55 }}>
            Submitting shares your details with Tawny only. Never with a third party, never with a marketing list.
          </p>
          <button style={{
            padding: '20px 36px', background: skin.submitBg, color: skin.submitFg, border: 'none',
            fontFamily: t.eyebrowFont,
            fontSize: 11.5, fontWeight: skin.isB ? 600 : 400,
            letterSpacing: skin.isB ? '0.28em' : '0.24em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>Send to Tawny →</button>
        </div>
      )}

      {/* Responsive rules baked in so the widget collapses correctly when
          embedded on the landing page (where the /inquiry page's <style> isn't
          mounted). */}
      <style>{`
        @media (max-width: 900px) {
          .tw-form-pair    { grid-template-columns: 1fr !important; }
          .tw-initial-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 540px) {
          .tw-initial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── The full /inquiry page ─────────────────────────────────────────────────
export default function Inquiry() {
  const skin = useInquirySkin();
  const t = skin.t;
  // Read the selected role for the left panel's portrait tone and quote
  const inq = useInquiryState({ syncUrl: true });
  const tone = inq.selected ? inq.selected.tone : 'warm';

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage, minHeight: '100vh' }}>
      <TopNav active="" />

      <div className="tw-inquiry-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr' }}>
        {/* LEFT — editorial panel */}
        <div style={{
          background: skin.leftBg, color: skin.leftFg,
          padding: 'clamp(40px, 7vw, 96px) clamp(20px, 5vw, 64px)',
          display: 'flex', flexDirection: 'column',
        }}>
          <Eyebrow color={skin.leftAccent}>Begin a conversation · Confidential intake</Eyebrow>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 300,
            fontSize: 'clamp(40px, 6.5vw, 88px)', letterSpacing: '-0.022em',
            margin: '24px 0 0', lineHeight: 0.98, color: skin.leftFg,
          }}>
            Tell me how I <em style={{ fontStyle: 'italic' }}>can help.</em>
          </h1>
          <p style={{
            fontFamily: skin.isB ? t.fonts.display : t.fonts.body,
            fontStyle: skin.isB ? 'italic' : 'normal',
            fontWeight: skin.isB ? 400 : 300,
            fontSize: skin.isB ? 19 : 16.5,
            lineHeight: 1.6, color: skin.leftMuted, marginTop: 28, maxWidth: 460,
          }}>
            One short form, four kinds of conversation. Choose what you are: buyer, seller, investor, or agent. The intake tailors itself. Tawny reads each note personally and replies within one business day.
          </p>

          <div style={{ marginTop: 48, marginBottom: 36 }}>
            <Photo label="PORTRAIT — TAWNY WALKER, STUDIO" tone={tone} height={340} />
          </div>

          <div style={{ paddingTop: 28, borderTop: `1px solid ${skin.leftLine}` }}>
            <Eyebrow color={skin.leftAccent}>From the studio</Eyebrow>
            <p style={{
              fontFamily: t.fonts.display, fontStyle: 'italic',
              fontSize: 22, lineHeight: 1.5, color: skin.leftFg, marginTop: 14, fontWeight: 400,
            }}>
              {inq.selected ? inq.selected.note : '"Every good conversation in real estate begins with a single, honest sentence: I am a ___ . The rest follows." TW'}
            </p>
          </div>

          <div style={{
            marginTop: 'auto', paddingTop: 40,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontFamily: t.eyebrowFont, fontSize: 10.5,
            fontWeight: skin.isB ? 600 : 400,
            letterSpacing: skin.isB ? '0.28em' : '0.22em',
            textTransform: 'uppercase',
            color: skin.isB ? 'rgba(255,255,255,0.55)' : t.fgFaint,
            flexWrap: 'wrap', gap: 12,
          }}>
            <span>Replies within 1 business day</span>
            <span>Encrypted intake · TLS 1.3</span>
          </div>
        </div>

        {/* RIGHT — the interactive widget */}
        <div style={{
          padding: 'clamp(40px, 7vw, 96px) clamp(20px, 5vw, 72px)',
          background: skin.rightBg,
        }}>
          {/* This page uses InquiryWidget with URL sync so ?as=buyer deep-links work */}
          <InquiryPageWidget />
        </div>
      </div>

      <SiteFooter />

      <style>{`
        @media (max-width: 900px) {
          .tw-inquiry-grid { grid-template-columns: 1fr !important; }
          .tw-initial-grid { grid-template-columns: 1fr 1fr !important; }
          .tw-form-pair    { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .tw-initial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// Same widget but bound to URL params so ?as=buyer deep-links work on /inquiry.
function InquiryPageWidget() {
  return <InquiryWidget syncUrl={true} />;
}
