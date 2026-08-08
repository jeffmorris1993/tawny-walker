import { OTHER_SUFFIX } from '../../../lib/inquirySchema';
import RangeInput from './RangeInput';
import { fieldId } from './fieldId';

function Head({ f }) {
  return (
    <>
      {f.label}
      {f.required && <span className="tcf-req">REQUIRED</span>}
      {f.optional && <span className="tcf-opt">OPTIONAL</span>}
    </>
  );
}

function Err({ id, msg }) {
  if (!msg) return null;
  return (
    <p className="tcf-err" id={id}>
      <span aria-hidden="true">△</span><span>{msg}</span>
    </p>
  );
}

export default function Field({ f, values, error, onChange, autoFocus }) {
  const id = fieldId(f.name);
  const errId = `${id}-err`;
  const value = values[f.name];

  if (f.type === 'range') {
    return <RangeInput f={f} value={value} onChange={onChange} id={id} />;
  }

  // Chips and radios are grouped controls: the label has to be a <legend>
  // inside a <fieldset>, or screen readers announce each option without the
  // question it belongs to.
  if (f.type === 'chips' || f.type === 'radio') {
    const multi = f.type === 'chips';
    const selected = multi ? (value || []) : value;

    const toggle = (option) => {
      if (!multi) return onChange(f.name, option);
      const current = value || [];
      onChange(f.name, current.includes(option)
        ? current.filter(v => v !== option)
        : current.concat(option));
    };

    const showOther = multi && f.otherField && (value || []).includes('Other');

    return (
      <fieldset
        style={{ border: 0, margin: 0, padding: 0, minInlineSize: 'auto' }}
        aria-describedby={error ? errId : undefined}
      >
        <legend className="tcf-label" id={id}><Head f={f} /></legend>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {f.options.map(option => multi ? (
            <button
              type="button" key={option}
              className={`tcf-chip${error ? ' tcf-invalid' : ''}`}
              aria-pressed={selected.includes(option)}
              onClick={() => toggle(option)}
            >
              {selected.includes(option) && <span aria-hidden="true" style={{ marginRight: 7 }}>✓</span>}
              {option}
            </button>
          ) : (
            <label
              key={option}
              className={`tcf-radio${selected === option ? ' is-on' : ''}${error ? ' tcf-invalid' : ''}`}
            >
              <input
                className="tcf-sr" type="radio" name={id} value={option}
                checked={selected === option} onChange={() => toggle(option)}
              />
              {selected === option && <span aria-hidden="true" style={{ marginRight: 7 }}>✓</span>}
              {option}
            </label>
          ))}
        </div>

        {/* Revealed by picking 'Other'. Without it the answer is just the word
            "Other", which tells the studio nothing. */}
        {showOther && (
          <div style={{ marginTop: 14 }}>
            <label className="tcf-label" htmlFor={`${id}-other`} style={{ fontSize: 9.5 }}>
              Other, please specify
            </label>
            <input
              id={`${id}-other`}
              className="tcf-input"
              type="text"
              maxLength={120}
              value={values[`${f.name}${OTHER_SUFFIX}`] || ''}
              onChange={e => onChange(`${f.name}${OTHER_SUFFIX}`, e.target.value)}
              placeholder="Which area?"
            />
          </div>
        )}

        <Err id={errId} msg={error} />
      </fieldset>
    );
  }

  const shared = {
    id,
    value: value == null ? '' : value,
    'aria-required': f.required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errId : undefined,
    onChange: e => onChange(f.name, e.target.value),
  };

  return (
    <div>
      <label className="tcf-label" htmlFor={id}><Head f={f} /></label>

      {f.type === 'select' ? (
        <select {...shared} className={`tcf-select${error ? ' tcf-invalid' : ''}`} autoFocus={autoFocus}>
          <option value="">Select…</option>
          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : f.type === 'textarea' ? (
        <textarea
          {...shared}
          className={`tcf-area${error ? ' tcf-invalid' : ''}`}
          placeholder={f.placeholder}
          rows={4}
          // Matches the mandate_notes cap enforced by submit_inquiry, so an
          // over-long note is prevented rather than silently truncated.
          maxLength={4000}
          autoFocus={autoFocus}
        />
      ) : (
        <input
          {...shared}
          className={`tcf-input${error ? ' tcf-invalid' : ''}`}
          type={f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : 'text'}
          placeholder={f.placeholder}
          autoComplete={f.autoComplete}
          maxLength={200}
          autoFocus={autoFocus}
        />
      )}

      <Err id={errId} msg={error} />
    </div>
  );
}
