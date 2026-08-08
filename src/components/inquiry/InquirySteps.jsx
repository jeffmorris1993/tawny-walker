import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../Eyebrow';
import Field from './fields/Field';
import { SERVICE_KEYS, SERVICES } from '../../data/inquiryServices';
import { aboutFields, visibleAnswers } from '../../lib/inquirySchema';

// ── shared chrome ──────────────────────────────────────────────────────────
export function StepHead({ n, title, sub }) {
  const t = useTheme();
  return (
    <div style={{ marginBottom: 30 }}>
      <Eyebrow>§ {n}</Eyebrow>
      <h2 style={{
        fontFamily: t.fonts.display, fontWeight: 400,
        fontSize: 'clamp(26px, 3.2vw, 34px)', lineHeight: 1.12,
        letterSpacing: '-0.018em', color: t.palette.emerald, margin: '16px 0 0',
      }}>{title}</h2>
      {sub && (
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: t.fgMuted, marginTop: 14, maxWidth: 520 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// `full` fields span both columns; the grid collapses to one column under
// 640px via .tcf-grid-2 in forms.css.
function FieldGrid({ fields, values, errors, onChange }) {
  return (
    <div className="tcf-grid-2" style={{ gap: '30px 34px' }}>
      {fields.map(f => (
        <div key={f.name} style={f.full ? { gridColumn: '1 / -1' } : undefined}>
          <Field f={f} values={values} error={errors[f.name]} onChange={onChange} />
        </div>
      ))}
    </div>
  );
}

// ── I · Direction ──────────────────────────────────────────────────────────
export function StepDirection({ serviceKey, onPick }) {
  const t = useTheme();
  return (
    <>
      <StepHead
        n="I · Direction"
        title="How can Tawny & Co. help you?"
        sub="Choose the closest fit. Only the questions relevant to your answer will follow."
      />
      <div style={{ display: 'grid', gap: 12 }}>
        {SERVICE_KEYS.map(key => {
          const s = SERVICES[key];
          const selected = serviceKey === key;
          return (
            <button
              type="button" key={key} className="tcf-card"
              aria-pressed={selected} onClick={() => onPick(key)}
            >
              <span style={{
                fontFamily: t.wordmark.ampersandFamily, fontStyle: 'italic',
                fontSize: 26, color: t.accent, lineHeight: 1, width: 28,
              }}>{s.numeral}</span>
              <span>
                <span style={{
                  display: 'block', fontFamily: t.fonts.display,
                  fontSize: 'clamp(19px, 2vw, 24px)', letterSpacing: '-0.012em',
                  color: t.palette.emerald, lineHeight: 1.15,
                }}>{s.label}</span>
                <span style={{
                  display: 'block', fontSize: 14, lineHeight: 1.65,
                  color: t.fgMuted, marginTop: 8,
                }}>{s.desc}</span>
              </span>
              <span className="tw-card-choose" style={{
                fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
                letterSpacing: '0.24em', textTransform: 'uppercase',
                color: selected ? t.palette.emerald : t.fgFaint,
              }}>{selected ? '✓ Chosen' : 'Choose'}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// ── II · About you ─────────────────────────────────────────────────────────
export function StepAbout({ service, values, errors, onChange }) {
  return (
    <>
      <StepHead
        n={`II · ${service?.aboutTitle || 'About you'}`}
        title="Where should we reach you?"
        sub="Your details stay between you and Tawny, so she can reach you whichever way suits."
      />
      <FieldGrid fields={aboutFields(service)} values={values} errors={errors} onChange={onChange} />
    </>
  );
}

// ── III · The details ──────────────────────────────────────────────────────
export function StepDetails({ service, values, errors, onChange }) {
  const t = useTheme();
  if (!service) return null;

  return (
    <>
      <StepHead
        n={`III · ${service.short}`}
        title={service.key === 'unsure' ? 'Tell us a little more.' : 'A few details about what you need.'}
        sub={service.key === 'unsure'
          ? 'However much or little you know is fine.'
          : `These are the only questions we need for a ${service.short.toLowerCase()} conversation.`}
      />
      {service.groups.map((g, i) => (
        <div key={g.title} style={{ marginTop: i ? 44 : 0 }}>
          <div style={{ paddingBottom: 14, marginBottom: 28, borderBottom: `1px solid ${t.line}` }}>
            <Eyebrow>{g.title}</Eyebrow>
          </div>
          <FieldGrid fields={g.fields} values={values} errors={errors} onChange={onChange} />
        </div>
      ))}
    </>
  );
}

// ── IV · Review ────────────────────────────────────────────────────────────
export function StepReview({ service, values, onEditStep }) {
  const t = useTheme();
  // Same traversal the lead mapper uses, so what's confirmed here is exactly
  // what reaches the studio.
  const rows = visibleAnswers(service, values);

  return (
    <>
      <StepHead n="IV · Review" title="Does this look right?" sub="Change anything before it reaches Tawny." />
      <div style={{ border: `1px solid ${t.line}`, padding: 'clamp(20px, 3vw, 30px) clamp(20px, 3vw, 34px)', background: t.bgPanel }}>
        <Eyebrow>Your direction</Eyebrow>
        <div style={{ marginTop: 10 }}>
          <ReviewRow
            label="How we can help"
            value={service?.label || '—'}
            onEdit={() => onEditStep(0)}
          />
          {rows.map(r => (
            <ReviewRow
              key={r.name}
              label={r.label}
              value={r.answer}
              onEdit={() => onEditStep(r.step)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ReviewRow({ label, value, onEdit }) {
  const t = useTheme();
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto', gap: 20,
      padding: '14px 0', borderBottom: `1px solid ${t.lineSoft}`, alignItems: 'baseline',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
          letterSpacing: '0.24em', textTransform: 'uppercase', color: t.fgFaint,
        }}>{label}</div>
        <div style={{
          fontSize: 15, lineHeight: 1.6, color: value ? t.palette.emerald : t.fgFaint,
          marginTop: 7, wordBreak: 'break-word',
        }}>{value || '—'}</div>
      </div>
      {onEdit && (
        <button type="button" className="tcf-link" onClick={onEdit}>Edit</button>
      )}
    </div>
  );
}
