import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/DirectionContext';
import Wordmark from '../../components/Wordmark';
import Photo, { PHOTOS } from '../../components/Photo';
import Eyebrow from '../../components/Eyebrow';
import { STUDIO } from '../../data/listings';
import { signIn } from '../../lib/queries';
import { required, isEmail, firstError } from '../../lib/validation';

// Private admin login. Split layout: left identity panel with real photography,
// right form. Same form schema in both directions — visuals diverge through
// the theme.

const FOOTER_LICENSE = `© 2026 Tawny & Co. · ${STUDIO.brokeredBy}`;
const FOOTER_NOTE = 'Private admin only. All activity is logged.';

function FormField({ label, value, onChange, type = 'text', display, trailing, mono = false, large = false, placeholder = '', error, autoComplete }) {
  const t = useTheme();
  const isB = t.key === 'B';
  const errorColor = '#B5341F';
  return (
    <div>
      <div style={{
        fontFamily: t.eyebrowFont,
        fontSize: 10, fontWeight: isB ? 600 : 400,
        letterSpacing: '0.28em', textTransform: 'uppercase',
        color: error ? errorColor : t.fgFaint,
      }}>{label}</div>
      <div style={{
        marginTop: 10, paddingBottom: 14,
        borderBottom: `1px solid ${error ? errorColor : (isB ? t.palette.emerald : t.palette.ink)}`,
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12,
      }}>
        {display ? (
          <span style={{
            fontFamily: t.fonts.display,
            fontSize: large ? (isB ? 26 : 28) : (isB ? 22 : 24),
            color: t.fgPage,
            letterSpacing: mono ? '0.32em' : '-0.005em',
          }}>{display}</span>
        ) : (
          <input
            type={type}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            style={{
              flex: 1, minWidth: 0,
              background: 'transparent', border: 'none', outline: 'none', padding: 0,
              fontFamily: t.fonts.display, fontSize: large ? 26 : 22,
              color: t.fgPage, letterSpacing: mono ? '0.3em' : '-0.005em',
            }}
          />
        )}
        {trailing}
      </div>
      {error && (
        <div style={{ marginTop: 6, fontSize: 11, color: errorColor, fontFamily: t.fonts.body }}>{error}</div>
      )}
    </div>
  );
}

function useLoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const nextErrors = {};
    const emailErr = firstError(required(email, 'Email'), isEmail(email));
    if (emailErr) nextErrors.email = emailErr;
    const passErr = required(password, 'Password');
    if (passErr) nextErrors.password = passErr;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setSubmitError(null);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      setSubmitError(error.message || 'Sign in failed.');
      return;
    }
    navigate('/admin');
  }

  return {
    email, setEmail, password, setPassword,
    errors, submitError, submitting,
    handleSubmit,
  };
}

// ─── DIRECTION A ────────────────────────────────────────────────────────────
function LoginA() {
  const t = useTheme();
  const { email, setEmail, password, setPassword, errors, submitError, submitting, handleSubmit } = useLoginForm();

  return (
    <div className="tw-login-root" style={{
      minHeight: '100vh', background: t.bgPage,
      fontFamily: t.fonts.body, color: t.fgPage, display: 'flex',
    }}>
      {/* LEFT — photographic panel */}
      <div className="tw-login-side" style={{
        width: '50%', position: 'relative', overflow: 'hidden', minHeight: 700,
      }}>
        <Photo label="BIRMINGHAM · METRO DETROIT" tone="dusk" height="100%" src={PHOTOS.livingMarble} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(27,27,26,0) 0%, rgba(27,27,26,0.45) 60%, rgba(27,27,26,0.65) 100%)',
        }} />
        <div style={{ position: 'absolute', top: 48, left: 56 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Wordmark size={22} light sub={false} color="#FFFFFF" />
          </Link>
          <div style={{
            marginTop: 6,
            fontFamily: t.eyebrowFont,
            fontSize: 9.5, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
          }}>Private · Admin</div>
        </div>
        <div className="tw-login-quote" style={{ position: 'absolute', left: 56, right: 56, bottom: 56 }}>
          <div style={{
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
          }}>In her own words</div>
          <p style={{
            marginTop: 14,
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(28px, 3.2vw, 40px)', lineHeight: 1.2,
            color: '#FFFFFF', maxWidth: 520, letterSpacing: '-0.01em',
          }}>
            More than an agent.<br />
            <em style={{ fontStyle: 'italic' }}>A network.</em>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
            <span style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.5)' }} />
            <span style={{
              fontFamily: t.eyebrowFont,
              fontSize: 10.5, letterSpacing: '0.28em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
            }}>Tawny Walker</span>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="tw-login-form" style={{
        flex: 1, padding: 'clamp(32px, 5vw, 72px) clamp(24px, 6vw, 88px)',
        display: 'flex', flexDirection: 'column',
        borderLeft: `1px solid ${t.line}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Eyebrow>Sign in · № 01</Eyebrow>
          <span style={{
            fontFamily: t.eyebrowFont,
            fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: t.fgFaint,
          }}>
            Need help?{' '}
            <span style={{ color: t.fgPage, borderBottom: `1px solid ${t.fgPage}`, paddingBottom: 2, marginLeft: 6 }}>
              {STUDIO.email}
            </span>
          </span>
        </div>

        <div style={{ marginTop: 56 }}>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(44px, 5vw, 64px)', margin: 0,
            letterSpacing: '-0.02em', lineHeight: 1.02,
          }}>
            Welcome <em style={{ fontStyle: 'italic' }}>back.</em>
          </h1>
          <p style={{
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 'clamp(17px, 1.6vw, 21px)', color: t.fgMuted,
            margin: '12px 0 0', maxWidth: 460, lineHeight: 1.5,
          }}>
            Sign in to review today's leads, compose listings, and continue the correspondence already in motion.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ marginTop: 56, maxWidth: 460 }}>
          <FormField
            label="Email address"
            value={email}
            onChange={setEmail}
            type="email"
            autoComplete="username"
            placeholder="you@studio.com"
            error={errors.email}
          />
          <div style={{ marginTop: 36 }}>
            <FormField
              label="Password"
              value={password}
              onChange={setPassword}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              mono large
              error={errors.password}
            />
          </div>

          {submitError && (
            <div style={{ marginTop: 24, padding: '12px 16px', border: '1px solid #B5341F', color: '#B5341F', fontSize: 12, lineHeight: 1.5 }}>
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 40, width: '100%', boxSizing: 'border-box', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 28px',
              background: t.palette.ink, color: t.palette.bone,
              fontFamily: t.eyebrowFont,
              fontSize: 11.5, letterSpacing: '0.28em', textTransform: 'uppercase',
              cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
            <span style={{ fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 22, letterSpacing: 0 }}>→</span>
          </button>
        </form>

        <div className="tw-login-foot" style={{
          marginTop: 'auto', paddingTop: 32, borderTop: `1px solid ${t.line}`,
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          fontFamily: t.eyebrowFont,
          fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint,
        }}>
          <span>{FOOTER_LICENSE}</span>
          <span>{FOOTER_NOTE}</span>
        </div>
      </div>

      <LoginStyles />
    </div>
  );
}

// ─── DIRECTION B ────────────────────────────────────────────────────────────
function LoginB() {
  const t = useTheme();
  const { email, setEmail, password, setPassword, errors, submitError, submitting, handleSubmit } = useLoginForm();

  return (
    <div className="tw-login-root" style={{
      minHeight: '100vh', background: t.bgPage,
      fontFamily: t.fonts.body, color: t.fgPage, display: 'flex',
    }}>
      {/* LEFT — emerald panel */}
      <div className="tw-login-side" style={{
        width: '50%', minHeight: 700, position: 'relative', overflow: 'hidden',
        background: t.palette.emerald, color: '#FFFFFF',
        padding: 'clamp(40px, 5vw, 64px)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* gold corner motifs */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 220, height: 220,
          border: `1px solid ${t.palette.gold}`, borderRadius: '50%', opacity: 0.18,
        }} />
        <div style={{
          position: 'absolute', top: -160, right: -160, width: 460, height: 460,
          border: `1px solid ${t.palette.gold}`, borderRadius: '50%', opacity: 0.1,
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Wordmark size={26} light sub={false} />
            </Link>
            <div style={{
              marginTop: 10,
              fontFamily: t.eyebrowFont,
              fontSize: 9.5, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase',
              color: t.palette.goldSoft,
            }}>Private · Admin</div>
          </div>
          <span style={{
            padding: '7px 14px', border: `1px solid ${t.palette.gold}`,
            color: t.palette.goldSoft,
            fontFamily: t.eyebrowFont,
            fontSize: 9, fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase',
          }}>● Secure session</span>
        </div>

        {/* center mark + caption */}
        <div className="tw-login-mark" style={{
          margin: 'clamp(40px, 6vw, 64px) 0 clamp(32px, 5vw, 48px)',
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'flex-end', gap: 28, flexWrap: 'wrap',
        }}>
          <div style={{
            width: 132, height: 132, border: `1px solid ${t.palette.gold}`,
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <span style={{
              fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic',
              fontWeight: 400, fontSize: 120, color: t.palette.goldSoft, lineHeight: 1,
              position: 'relative', top: 8,
            }}>&amp;</span>
          </div>
          <div style={{ paddingBottom: 4 }}>
            <div style={{
              fontFamily: t.eyebrowFont,
              fontSize: 10, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase',
              color: t.palette.gold,
            }}>The Studio</div>
            <div style={{
              fontFamily: t.fonts.display, fontWeight: 400,
              fontSize: 'clamp(22px, 2.4vw, 30px)', color: '#FFFFFF',
              marginTop: 10, lineHeight: 1.2, maxWidth: 340,
            }}>A quiet room for considered work.</div>
          </div>
        </div>

        {/* photo strip */}
        <div className="tw-login-photo" style={{ flex: 1, position: 'relative', minHeight: 160 }}>
          <Photo label="BIRMINGHAM · METRO DETROIT" tone="dusk" height="100%" src={PHOTOS.livingMarble} />
        </div>

        {/* quote */}
        <div style={{
          marginTop: 36, paddingTop: 28,
          borderTop: '1px solid rgba(217,197,162,0.25)', position: 'relative',
        }}>
          <div style={{
            fontFamily: t.fonts.display,
            fontWeight: 400, fontSize: 'clamp(22px, 2.4vw, 30px)', lineHeight: 1.25,
            color: '#FFFFFF', maxWidth: 540, letterSpacing: '-0.01em',
          }}>
            More than an agent.{' '}
            <em style={{ fontStyle: 'italic' }}>A network.</em>
          </div>
          <div style={{
            marginTop: 16,
            fontFamily: t.eyebrowFont,
            fontSize: 10, fontWeight: 600, letterSpacing: '0.32em', textTransform: 'uppercase',
            color: t.palette.goldSoft,
          }}>Tawny Walker</div>
        </div>
      </div>

      {/* RIGHT — form on white */}
      <div className="tw-login-form" style={{
        flex: 1, padding: 'clamp(32px, 5vw, 72px) clamp(24px, 6vw, 88px)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <Eyebrow>Sign in · Private admin</Eyebrow>
          <span style={{
            fontFamily: t.eyebrowFont,
            fontSize: 10, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: t.fgFaint,
          }}>
            Need help?{' '}
            <span style={{ color: t.palette.emerald, borderBottom: `1px solid ${t.palette.emerald}`, paddingBottom: 2, marginLeft: 6 }}>
              {STUDIO.email}
            </span>
          </span>
        </div>

        <div style={{ marginTop: 56 }}>
          <h1 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(44px, 5vw, 64px)', margin: 0,
            letterSpacing: '-0.02em', lineHeight: 1.02,
            color: t.palette.emerald,
          }}>
            Welcome <em style={{ fontStyle: 'italic' }}>back.</em>
          </h1>
          <p style={{
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 'clamp(17px, 1.6vw, 21px)', color: t.fgMuted,
            margin: '12px 0 0', maxWidth: 460, lineHeight: 1.5,
          }}>
            Sign in to review today's leads, compose residences, and continue the correspondence already in motion.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ marginTop: 56, maxWidth: 460 }}>
          <FormField
            label="Email address"
            value={email}
            onChange={setEmail}
            type="email"
            autoComplete="username"
            placeholder="you@studio.com"
            error={errors.email}
          />
          <div style={{ marginTop: 36 }}>
            <FormField
              label="Password"
              value={password}
              onChange={setPassword}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              mono large
              error={errors.password}
            />
          </div>

          {submitError && (
            <div style={{ marginTop: 24, padding: '12px 16px', border: '1px solid #B5341F', color: '#B5341F', fontSize: 12, lineHeight: 1.5 }}>
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 40, width: '100%', boxSizing: 'border-box', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 28px',
              background: t.palette.emerald, color: '#FFFFFF',
              fontFamily: t.eyebrowFont,
              fontSize: 11.5, fontWeight: 500, letterSpacing: '0.28em', textTransform: 'uppercase',
              cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: 22, letterSpacing: 0 }}>→</span>
          </button>
        </form>

        <div className="tw-login-foot" style={{
          marginTop: 'auto', paddingTop: 32, borderTop: `1px solid ${t.line}`,
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          fontFamily: t.eyebrowFont,
          fontSize: 9.5, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint,
        }}>
          <span>{FOOTER_LICENSE}</span>
          <span>{FOOTER_NOTE}</span>
        </div>
      </div>

      <LoginStyles />
    </div>
  );
}

function LoginStyles() {
  return (
    <style>{`
      @media (max-width: 900px) {
        .tw-login-root  { flex-direction: column !important; }
        .tw-login-side  { width: 100% !important; min-height: 360px !important; }
        .tw-login-form  { border-left: none !important; }
        .tw-login-quote { position: static !important; padding: 32px 0 0; }
        .tw-login-mark  { gap: 16px !important; }
      }
      @media (max-width: 540px) {
        .tw-login-alts  { flex-direction: column !important; }
        .tw-login-foot  { font-size: 9px !important; }
      }
    `}</style>
  );
}

export default function Login() {
  const t = useTheme();
  return t.key === 'B' ? <LoginB /> : <LoginA />;
}
