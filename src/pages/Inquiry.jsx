import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TW } from '../tokens';
import Photo from '../components/Photo';
import TopNav from '../components/TopNav';
import Eyebrow from '../components/Eyebrow';

const ROLES = {
  buyer: {
    label: 'Buyer', sub: 'Looking for a home to live in.',
    roman: 'I', tone: 'warm', title: 'Find a home worth living in.',
    note: '"I treat every buyer like they only get one shot at this. Many of them only do." — TW',
    fields: [
      { group: 'About you', cols: [
        { label: 'Name', placeholder: 'First and last', type: 'text' },
        { label: 'Best contact', placeholder: 'Email or mobile', type: 'text' },
      ]},
      { group: 'The search', cols: [
        { label: 'Household', placeholder: 'Single / Couple / Family…', type: 'text' },
        { label: 'Primary or secondary home?', placeholder: 'Primary / Secondary / Investment', type: 'text' },
      ]},
      { type: 'chips', label: 'Neighborhoods of interest', options: ['Coral Gables', 'Coconut Grove', 'Key Biscayne', 'Miami Beach', 'Surfside', 'Pinecrest'] },
      { type: 'range', label: 'Comfortable price range', minLabel: '$1M', maxLabel: '$20M+' },
      { type: 'pair', cols: [
        { label: 'Ideal move date', placeholder: 'e.g. Summer 2026', type: 'text' },
        { label: 'Financing', placeholder: 'Pre-approved / Cash / TBD', type: 'text' },
      ]},
      { type: 'note', label: 'Anything she should know?' },
    ],
  },
  seller: {
    label: 'Seller', sub: 'Considering listing a property.',
    roman: 'II', tone: 'bone', title: 'List with intention, not urgency.',
    note: '"The best sales happen quietly. The second-best happen patiently." — TW',
    fields: [
      { group: 'About you', cols: [
        { label: 'Name', placeholder: 'First and last', type: 'text' },
        { label: 'Best contact', placeholder: 'Email or mobile', type: 'text' },
      ]},
      { group: 'The property', cols: [
        { label: 'Address', placeholder: 'Street address', type: 'text' },
        { label: 'Property type', placeholder: 'Single-family / Condo / Other', type: 'text' },
      ]},
      { type: 'pair', cols: [
        { label: 'Approx. square footage', placeholder: 'SF', type: 'text' },
        { label: 'Year acquired', placeholder: 'YYYY', type: 'text' },
      ]},
      { type: 'range', label: 'Owner-estimated value', minLabel: '$1M', maxLabel: '$30M+' },
      { type: 'pair', cols: [
        { label: 'Property condition', placeholder: 'Original / Updated / Renovated', type: 'text' },
        { label: 'Ideal listing window', placeholder: 'e.g. Q3 2026', type: 'text' },
      ]},
      { type: 'note', label: 'Anything she should know?' },
    ],
  },
  investor: {
    label: 'Investor', sub: '1031, family office, or repeat acquirer.',
    roman: 'III', tone: 'dusk', title: 'Build a portfolio, quietly.',
    note: '"I find buildings the rest of the market has misread, and I introduce them to people who recognize them." — TW',
    fields: [
      { group: 'Principal & vehicle', cols: [
        { label: 'Name', placeholder: 'First and last', type: 'text' },
        { label: 'Entity', placeholder: 'LLC / Trust / Individual', type: 'text' },
      ]},
      { group: 'Mandate', cols: [
        { label: 'Investor type', placeholder: '1031 / Family Office / Individual', type: 'text' },
        { label: 'Hold horizon', placeholder: 'e.g. 7+ years', type: 'text' },
      ]},
      { type: 'chips', label: 'Asset class', options: ['Small multi-family', 'Mixed-use', 'SFR rental', 'Boutique hotel', 'Trophy SFR', 'Condo portfolio'] },
      { type: 'range', label: 'Deployable capital this cycle', minLabel: '$1M', maxLabel: '$50M+' },
      { type: 'pair', cols: [
        { label: 'Target unlevered yield', placeholder: 'e.g. 5–7%', type: 'text' },
        { label: 'Open to off-market?', placeholder: 'Yes / Preferred / No', type: 'text' },
      ]},
      { type: 'note', label: 'Mandate notes' },
    ],
  },
  agent: {
    label: 'Agent / Renter', sub: 'Co-broke, refer, or rent for a season.',
    roman: 'IV', tone: 'sage', title: 'Refer, co-broke, or rent for a season.',
    note: '"Co-brokes are honored, season rentals are easy, referrals are answered the same day." — TW',
    fields: [
      { group: 'About you', cols: [
        { label: 'Name', placeholder: 'First and last', type: 'text' },
        { label: 'Best contact', placeholder: 'Email or mobile', type: 'text' },
      ]},
      { group: 'Your role', cols: [
        { label: 'I am a…', placeholder: 'Referring agent / Renter / Both', type: 'text' },
        { label: 'Brokerage / org', placeholder: 'Company name or N/A', type: 'text' },
      ]},
      { type: 'pair', cols: [
        { label: 'Stay length (if renter)', placeholder: 'e.g. Nov 2026 – Apr 2027', type: 'text' },
        { label: 'Beds preferred', placeholder: 'e.g. 3 BD', type: 'text' },
      ]},
      { type: 'chips', label: 'Neighborhoods', options: ['Miami Beach', 'Surfside', 'Bal Harbour', 'Coconut Grove', 'Key Biscayne', 'Coral Gables'] },
      { type: 'range', label: 'Monthly budget (furnished)', minLabel: '$5K/mo', maxLabel: '$50K+/mo' },
      { type: 'note', label: 'Notes' },
    ],
  },
};

const ROLE_KEYS = ['buyer', 'seller', 'investor', 'agent'];

function FormInput({ label, placeholder, type = 'text' }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginBottom: 12 }}>{label}</div>
      <input
        type={type}
        placeholder={placeholder}
        style={{
          width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${TW.ink2}`,
          outline: 'none', padding: '8px 0', fontFamily: '"Cormorant Garamond", serif', fontSize: 20,
          color: TW.ink, lineHeight: 1.3,
        }}
        onFocus={e => e.target.style.borderBottomColor = TW.ink}
        onBlur={e => e.target.style.borderBottomColor = TW.ink2}
      />
    </div>
  );
}

function ChipsField({ label, options }) {
  const [selected, setSelected] = useState([]);
  const toggle = (o) => setSelected(s => s.includes(o) ? s.filter(x => x !== o) : [...s, o]);
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginBottom: 12 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map(o => (
          <span key={o} onClick={() => toggle(o)} style={{
            padding: '8px 14px',
            background: selected.includes(o) ? TW.ink : 'transparent',
            color: selected.includes(o) ? TW.bone : TW.ink2,
            border: selected.includes(o) ? `1px solid ${TW.ink}` : `1px solid ${TW.line}`,
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
            cursor: 'pointer', userSelect: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            {o} {selected.includes(o) ? <span style={{ opacity: 0.5 }}>×</span> : <span style={{ opacity: 0.5 }}>+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function RangeField({ label, minLabel, maxLabel }) {
  const [value, setValue] = useState(50);
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginBottom: 12 }}>{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 }}>
        <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28 }}>{minLabel}</span>
        <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 14, color: TW.ink3 }}>to</span>
        <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 28 }}>{maxLabel}</span>
      </div>
      <div style={{ position: 'relative', marginTop: 18 }}>
        <input type="range" min={0} max={100} value={value} onChange={e => setValue(Number(e.target.value))}
          style={{ width: '100%', appearance: 'none', height: 1, background: `linear-gradient(to right, ${TW.ink} ${value}%, ${TW.line} ${value}%)`, outline: 'none', cursor: 'pointer' }} />
        <style>{`
          input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${TW.bronze}; cursor: pointer; }
          input[type=range]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: ${TW.bronze}; cursor: pointer; border: none; }
        `}</style>
      </div>
    </div>
  );
}

function NoteField({ label }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, marginBottom: 12 }}>{label}</div>
      <textarea
        placeholder="Write freely — this goes directly to Tawny."
        style={{
          width: '100%', background: 'transparent', border: 'none', borderBottom: `1px solid ${TW.ink2}`,
          outline: 'none', padding: '8px 0', fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic', fontSize: 18, color: TW.ink, lineHeight: 1.55,
          resize: 'none', minHeight: 80,
        }}
        onFocus={e => e.target.style.borderBottomColor = TW.ink}
        onBlur={e => e.target.style.borderBottomColor = TW.ink2}
      />
    </div>
  );
}

function RoleForm({ role }) {
  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36, paddingBottom: 18, borderBottom: `1px solid ${TW.line}` }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: TW.bronze }} />
        <span style={{ fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: TW.ink2 }}>
          Form tailored for a {role.label.toLowerCase()}
        </span>
        <span style={{ flex: 1, height: 1, background: TW.line }} />
        <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 14, color: TW.ink3 }}>
          {role.fields.length} sections
        </span>
      </div>

      {role.fields.map((f, i) => {
        if (f.group && f.cols) {
          return (
            <div key={i} style={{ marginBottom: 32 }}>
              <div style={{ marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${TW.line}` }}>
                <Eyebrow color={TW.bronze}>— {f.group}</Eyebrow>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }} className="tw-form-grid">
                {f.cols.map((c, j) => <FormInput key={j} {...c} />)}
              </div>
            </div>
          );
        }
        if (f.type === 'pair') {
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 28 }} className="tw-form-grid">
              {f.cols.map((c, j) => <FormInput key={j} {...c} />)}
            </div>
          );
        }
        if (f.type === 'chips') return <ChipsField key={i} label={f.label} options={f.options} />;
        if (f.type === 'range') return <RangeField key={i} label={f.label} minLabel={f.minLabel} maxLabel={f.maxLabel} />;
        if (f.type === 'note') return <NoteField key={i} label={f.label} />;
        return null;
      })}
    </div>
  );
}

export default function Inquiry() {
  const [searchParams] = useSearchParams();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(searchParams.get('role') || null);
  const [submitted, setSubmitted] = useState(false);
  const dropdownRef = useRef(null);

  const selected = selectedKey ? ROLES[selectedKey] : null;

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (key) => {
    setSelectedKey(key);
    setDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div style={{ background: TW.bone, minHeight: '100vh', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <TopNav />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 72, color: TW.bronze, lineHeight: 1 }}>✓</div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(40px, 5.6vw, 80px)', letterSpacing: '-0.022em', margin: '24px 0 0', lineHeight: 1 }}>
            Received.
          </h1>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 22, color: TW.ink2, maxWidth: 480, marginTop: 24, lineHeight: 1.5 }}>
            Tawny will read your note personally and reply within one business day.
          </p>
          <div style={{ marginTop: 48, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3 }}>
            morristechnologies1@gmail.com
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: TW.bone, fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', color: TW.ink, minHeight: '100vh' }}>
      <TopNav />

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)', minHeight: 'calc(100vh - 75px)' }} className="tw-inquiry-grid">

          {/* LEFT — editorial panel */}
          <div style={{ background: TW.paper, padding: 'clamp(48px, 6.1vw, 88px) clamp(24px, 4.4vw, 64px)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <Eyebrow>Begin a conversation · Confidential intake</Eyebrow>
            <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 300, fontSize: 'clamp(52px, 5.8vw, 84px)', letterSpacing: '-0.022em', margin: '24px 0 0', lineHeight: 0.98 }}>
              Tell&nbsp;me how I&nbsp;<em style={{ fontStyle: 'italic' }}>can help.</em>
            </h1>
            <p style={{ fontSize: 16.5, lineHeight: 1.65, color: TW.ink2, marginTop: 28, fontWeight: 300, maxWidth: 460 }}>
              One short form, four kinds of conversation. Choose what you are — buyer, seller, investor, or agent — and the intake tailors itself. Tawny reads each note personally and replies within one business day.
            </p>

            <div style={{ marginTop: 48, marginBottom: 32 }}>
              <Photo label="PORTRAIT — TAWNY WALKER, STUDIO" tone={selected ? selected.tone : 'warm'} height={300} />
            </div>

            <div style={{ paddingTop: 28, borderTop: `1px solid ${TW.line}` }}>
              <Eyebrow color={TW.bronze}>From the studio</Eyebrow>
              <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 20, lineHeight: 1.5, color: TW.ink, marginTop: 14 }}>
                {selected ? selected.note : '"Every good conversation in real estate begins with a single, honest sentence: I am a ___ . The rest follows." — TW'}
              </p>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3, flexWrap: 'wrap', gap: 12 }}>
              <span>Replies within 1 business day</span>
              <span>Confidential intake</span>
            </div>
          </div>

          {/* RIGHT — form */}
          <div style={{ padding: 'clamp(48px, 6.1vw, 88px) clamp(24px, 4.4vw, 64px) 64px', background: TW.bone }}>
            {/* header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
              <Eyebrow color={TW.bronze}>§ Intake · One form, four paths</Eyebrow>
              <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: TW.ink3 }}>
                {selected ? `${selected.roman} · ${selected.label.toUpperCase()}` : 'AWAITING SELECTION'}
              </div>
            </div>

            {/* THE DROPDOWN */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'baseline', gap: 18, paddingBottom: 22,
                  borderBottom: `2px solid ${TW.ink}`, cursor: 'pointer',
                }}>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(36px, 3.9vw, 56px)', color: TW.ink3, lineHeight: 1 }}>
                  I am a
                </span>
                <span style={{ flex: 1, position: 'relative' }}>
                  <span style={{
                    fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
                    fontSize: 'clamp(38px, 4.2vw, 60px)', color: selected ? TW.ink : TW.ink4, lineHeight: 1, letterSpacing: '-0.012em',
                  }}>
                    {selected ? selected.label : (dropdownOpen ? ' ' : 'choose…')}
                  </span>
                  {dropdownOpen && !selected && (
                    <span style={{ display: 'inline-block', width: 2, height: 48, background: TW.bronze, marginLeft: 2, verticalAlign: 'middle', transform: 'translateY(-4px)' }} />
                  )}
                </span>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 32, color: dropdownOpen ? TW.bronze : TW.ink3, transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
              </div>

              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10.5, letterSpacing: '0.24em', textTransform: 'uppercase', color: TW.ink3 }}>
                <span>{selected ? selected.sub : 'Required to begin'}</span>
                <span style={{ cursor: 'pointer' }} onClick={() => { setSelectedKey(null); setDropdownOpen(true); }}>
                  {selected ? 'Change selection' : '4 options'}
                </span>
              </div>

              {/* DROPDOWN OPTIONS */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  marginTop: 16, background: TW.bone,
                  border: `1px solid ${TW.ink}`,
                  boxShadow: '0 24px 48px -16px rgba(27,27,26,0.18)',
                  zIndex: 50,
                }}>
                  {ROLE_KEYS.map((k, i) => {
                    const r = ROLES[k];
                    return (
                      <div key={k}
                        onClick={() => handleSelect(k)}
                        style={{
                          display: 'grid', gridTemplateColumns: '64px 1fr auto',
                          gap: 24, alignItems: 'center',
                          padding: '24px 28px',
                          borderTop: i === 0 ? 'none' : `1px solid ${TW.line}`,
                          background: 'transparent', cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = TW.paper}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 28, color: TW.bronze, lineHeight: 1 }}>{r.roman}.</span>
                        <div>
                          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: 30, letterSpacing: '-0.012em', color: TW.ink, lineHeight: 1 }}>{r.label}</div>
                          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 16, color: TW.ink2, marginTop: 6 }}>{r.sub}</div>
                        </div>
                        <span style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: TW.ink3 }}>Select →</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* INITIAL HINT */}
            {!selected && !dropdownOpen && (
              <div style={{ marginTop: 56 }}>
                <div style={{ padding: '40px 0', borderBottom: `1px dashed ${TW.line}`, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }} className="tw-role-grid">
                  {ROLE_KEYS.map(k => {
                    const r = ROLES[k];
                    return (
                      <div key={k} onClick={() => handleSelect(k)} style={{
                        padding: '20px 16px', background: TW.paper, border: `1px solid ${TW.line}`,
                        display: 'flex', flexDirection: 'column', minHeight: 140, cursor: 'pointer',
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = TW.ink}
                        onMouseLeave={e => e.currentTarget.style.borderColor = TW.line}
                      >
                        <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 16, color: TW.bronze }}>{r.roman}.</span>
                        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 20, marginTop: 8, lineHeight: 1.05 }}>{r.label}</div>
                        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 13, color: TW.ink2, marginTop: 6, lineHeight: 1.4, flex: 1 }}>{r.sub}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 28, fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 17, color: TW.ink3, lineHeight: 1.55, maxWidth: 540 }}>
                  Choose above to begin. The form tailors itself to what you select — only the questions Tawny actually needs, never more.
                </div>
              </div>
            )}

            {/* ROLE FORM */}
            {selected && <RoleForm role={selected} />}

            {/* SUBMIT */}
            {selected && (
              <div style={{ marginTop: 48, paddingTop: 28, borderTop: `1px solid ${TW.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <p style={{ fontSize: 11.5, letterSpacing: '0.06em', color: TW.ink3, maxWidth: 380, margin: 0, lineHeight: 1.5 }}>
                  Submitting shares your details with Tawny only — never with a third party, never with a marketing list.
                </p>
                <button type="submit" style={{
                  padding: '20px 32px', background: TW.ink, color: TW.bone, border: 'none',
                  fontSize: 11.5, letterSpacing: '0.24em', textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                }}>
                  Send to Tawny →
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      <style>{`
        @media (max-width: 900px) {
          .tw-inquiry-grid { grid-template-columns: 1fr !important; }
          .tw-role-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .tw-role-grid { grid-template-columns: 1fr !important; }
          .tw-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
