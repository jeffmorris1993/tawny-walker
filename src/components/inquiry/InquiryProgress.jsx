import { useTheme } from '../../theme/DirectionContext';
import { STEPS } from '../../data/inquiryServices';

export default function InquiryProgress({ step, service }) {
  const t = useTheme();
  const micro = {
    fontFamily: t.eyebrowFont, fontSize: 10, fontWeight: 600,
    letterSpacing: '0.26em', textTransform: 'uppercase', color: t.fgFaint,
  };

  return (
    <div role="group" aria-label="Inquiry progress">
      {/* The segments are decorative; this is what a screen reader gets, and
          it re-announces on every step change. */}
      <p className="tcf-sr" aria-live="polite">
        Step {step + 1} of {STEPS.length}: {STEPS[step]}
      </p>

      <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`tcf-seg ${i < step ? 'is-done' : i === step ? 'is-now' : ''}`}
          />
        ))}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', gap: 16,
        marginTop: 12, ...micro,
      }}>
        <span>Step {step + 1} of {STEPS.length} · {STEPS[step]}</span>
        <span>{service ? service.short : 'Choosing a direction'}</span>
      </div>
    </div>
  );
}
