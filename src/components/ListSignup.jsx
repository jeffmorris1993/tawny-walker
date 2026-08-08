import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import { formVars, FORM_ERROR } from '../theme/formVars';
import { isEmail, isPhone } from '../lib/validation';
import { joinList } from '../lib/queries';
import { LIST_INTERESTS } from '../data/list';

// Join the Tawny & Co. list. Two fields, deliberately not dressed as an
// inquiry — this is a contact list, not a lead capture.
//
// Placement-agnostic so the same component can later drop into the footer or
// the inquiry confirmation without a rewrite; `source` is recorded on the row
// so the studio can see where someone came from.

// Same trap as the inquiry form: a submission faster than a human could
// plausibly type is a script. Tripping it fakes success rather than showing
// an error, so a scraper gets no signal to tune against.
const MIN_SUBMIT_MS = 2500;

const COPY = {
  cta: 'Keep Me in the Know',
  sending: 'Sending…',
  // No cadence promise and no unsubscribe promise: nothing sends to this list
  // yet, so neither claim would be true. Removal is handled by the privacy
  // policy's data-rights section.
  privacy: 'You’ll hear from Tawny & Co. occasionally. Your details stay with the studio and are never shared.',
  errors: {
    firstName: 'A first name, so the notes aren’t addressed to no one.',
    lastName: 'A last name, so Tawny knows who she’s writing to.',
    emailEmpty: 'An email address is needed to send anything.',
    emailBad: 'That email doesn’t look complete. Check for a typo.',
    phoneEmpty: 'A phone number, so Tawny can reach you directly.',
    phoneBad: 'That phone number doesn’t look complete. Check for a typo.',
    submit: 'Something went wrong. Please try again.',
    throttled: 'That has been sent a few times already. Please try again in an hour, or call the studio.',
  },
};

export default function ListSignup({
  source = 'home-list',
  showInterests = false,
  onDark = false,
  idPrefix = 'list',
}) {
  const t = useTheme();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interests, setInterests] = useState([]);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');   // idle | sending | success | error
  const [submitError, setSubmitError] = useState(COPY.errors.submit);
  const [sent, setSent] = useState(null);         // values captured at submit
  const [honeypot, setHoneypot] = useState('');
  const mountedAt = useRef(0);
  // Only re-validate on change once the user has tried to submit — otherwise
  // the form scolds them mid-typing.
  const attempted = useRef(false);

  useEffect(() => { mountedAt.current = Date.now(); }, []);

  function validate() {
    const next = {};
    if (!firstName.trim()) next.firstName = COPY.errors.firstName;
    if (!lastName.trim()) next.lastName = COPY.errors.lastName;

    const e = email.trim();
    if (!e) next.email = COPY.errors.emailEmpty;
    else next.email = isEmail(e, COPY.errors.emailBad) || undefined;

    // Both a way to write and a way to call: this is Tawny's contact list,
    // not a newsletter, so the phone is the point rather than a nicety.
    const p = phone.trim();
    if (!p) next.phone = COPY.errors.phoneEmpty;
    else if (isPhone(p)) next.phone = COPY.errors.phoneBad;

    Object.keys(next).forEach(k => next[k] === undefined && delete next[k]);
    return next;
  }

  function revalidate() {
    if (attempted.current) setErrors(validate());
  }

  function toggleInterest(value) {
    setInterests(prev =>
      prev.includes(value) ? prev.filter(i => i !== value) : prev.concat(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'sending') return;
    attempted.current = true;

    const captured = {
      firstName: firstName.trim(), lastName: lastName.trim(),
      email: email.trim(), phone: phone.trim(), interests,
    };

    // Bot traps — both fake a success so the behaviour is indistinguishable
    // from a real signup.
    if (honeypot) { setSent(captured); setStatus('success'); return; }
    if (Date.now() - mountedAt.current < MIN_SUBMIT_MS) {
      setSent(captured); setStatus('success'); return;
    }

    const found = validate();
    if (Object.keys(found).length) { setErrors(found); return; }
    setErrors({});
    setStatus('sending');

    const { error } = await joinList({
      firstName: captured.firstName,
      lastName: captured.lastName,
      email: captured.email,
      phone: captured.phone,
      source,
      interests,
    });

    if (error) {
      // The server refuses repeat submissions with a 429; anything else is a
      // genuine failure. Telling them apart matters, because "try again" is
      // the wrong advice for one of them.
      setSubmitError(error.code === '429' ? COPY.errors.throttled : COPY.errors.submit);
      setStatus('error');
      return;
    }
    setSent(captured);
    setStatus('success');
  }

  if (status === 'success') {
    return <ListSignupSuccess data={sent} onDark={onDark} />;
  }

  const muted = onDark ? 'rgba(248,245,238,0.6)' : t.fgFaint;

  return (
    <form
      className={`tcf${onDark ? ' tcf-dark' : ''}`}
      style={formVars(t)}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Join the Tawny and Co. list"
    >
      {/* Honeypot. Off-screen rather than display:none — some bots skip
          hidden fields, but few resist a labelled "company" input. */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: '-10000px', top: 'auto',
        width: 1, height: 1, overflow: 'hidden',
      }}>
        <label>
          Company name (leave blank)
          <input
            type="text" name="company" tabIndex={-1} autoComplete="organization"
            value={honeypot} onChange={e => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <div className="tcf-grid-2">
        <Field
          id={`${idPrefix}-first-name`}
          label="First name"
          error={errors.firstName}
          input={{
            type: 'text', value: firstName, autoComplete: 'given-name',
            maxLength: 80, placeholder: 'First',
            onChange: e => { setFirstName(e.target.value); revalidate(); },
          }}
        />
        {/* Two name fields rather than one: `leads` stores first_name and
            last_name separately, the admin sorts and searches on them, and
            splitting a single "full name" box back apart guesses wrong on
            anyone with two given names or a compound surname. */}
        <Field
          id={`${idPrefix}-last-name`}
          label="Last name"
          error={errors.lastName}
          input={{
            type: 'text', value: lastName, autoComplete: 'family-name',
            maxLength: 80, placeholder: 'Last',
            onChange: e => { setLastName(e.target.value); revalidate(); },
          }}
        />
        <Field
          id={`${idPrefix}-email`}
          label="Email address"
          error={errors.email}
          input={{
            type: 'email', value: email, autoComplete: 'email',
            maxLength: 200, placeholder: 'you@email.com',
            onChange: e => { setEmail(e.target.value); revalidate(); },
          }}
        />
        <Field
          id={`${idPrefix}-phone`}
          label="Phone"
          error={errors.phone}
          input={{
            type: 'tel', value: phone, autoComplete: 'tel',
            maxLength: 60, placeholder: 'Mobile or office',
            onChange: e => { setPhone(e.target.value); revalidate(); },
          }}
        />
      </div>

      {showInterests && (
        <fieldset style={{ border: 0, margin: '30px 0 0', padding: 0, minInlineSize: 'auto' }}>
          <legend className="tcf-label">
            What would you like to hear about?<span className="tcf-opt">OPTIONAL</span>
          </legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {LIST_INTERESTS.map(o => (
              <button
                type="button" key={o} className="tcf-chip"
                aria-pressed={interests.includes(o)}
                onClick={() => toggleInterest(o)}
              >
                {interests.includes(o) && <span aria-hidden="true" style={{ marginRight: 7 }}>✓</span>}
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div style={{ marginTop: 28 }}>
        <button type="submit" className="tcf-btn" disabled={status === 'sending'}>
          {status === 'sending' ? COPY.sending : COPY.cta}
        </button>
      </div>

      {status === 'error' && (
        <p role="alert" style={{
          fontFamily: t.fonts.body, fontSize: 12.5, lineHeight: 1.55,
          color: onDark ? '#E9B9AC' : FORM_ERROR, margin: '16px 0 0',
        }}>{submitError}</p>
      )}

      <p style={{
        fontFamily: t.fonts.body, fontSize: 11.5, lineHeight: 1.65,
        color: muted, margin: '22px 0 0', maxWidth: 520,
      }}>
        {COPY.privacy}{' '}
        <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>
          Privacy Policy
        </Link>.
      </p>
    </form>
  );
}

function Field({ id, label, error, input }) {
  const errId = `${id}-err`;
  return (
    <div>
      <label className="tcf-label" htmlFor={id}>
        {label}<span className="tcf-req">REQUIRED</span>
      </label>
      <input
        {...input}
        id={id}
        className={`tcf-input${error ? ' tcf-invalid' : ''}`}
        aria-required="true"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
      />
      {error && (
        <p className="tcf-err" id={errId}>
          <span aria-hidden="true">△</span><span>{error}</span>
        </p>
      )}
    </div>
  );
}

// Replaces the form in place. Reads the values captured at submit time so the
// greeting still renders after the inputs are cleared.
function ListSignupSuccess({ data = {}, onDark }) {
  const t = useTheme();
  const fg = onDark ? '#F8F5EE' : t.palette.emerald;
  const body = onDark ? 'rgba(248,245,238,0.78)' : t.fgMuted;

  return (
    <div
      role="status"
      className="tcf-fade"
      style={{
        borderTop: `1px solid ${onDark ? 'rgba(248,245,238,0.24)' : t.line}`,
        paddingTop: 28,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span aria-hidden="true" style={{
          fontFamily: t.wordmark.ampersandFamily, fontStyle: 'italic',
          fontSize: 30, color: t.accent, lineHeight: 1,
        }}>&amp;</span>
        <h3 style={{
          fontFamily: t.fonts.display, fontWeight: 400, fontSize: 30,
          letterSpacing: '-0.014em', color: fg, margin: 0,
        }}>
          {data.firstName ? `You’re on the list, ${data.firstName}.` : 'You’re on the list.'}
        </h3>
      </div>
      <p style={{
        fontFamily: t.fonts.body, fontSize: 15, lineHeight: 1.75,
        color: body, marginTop: 14, maxWidth: 520,
      }}>
        Tawny will be in touch when there’s something worth sending.
      </p>
      {!!data.interests?.length && (
        <p style={{
          fontFamily: t.eyebrowFont, fontSize: 10.5, fontWeight: 600,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: onDark ? t.accentSoft : t.accent, marginTop: 16,
        }}>Noted: {data.interests.join(' · ')}</p>
      )}
    </div>
  );
}
