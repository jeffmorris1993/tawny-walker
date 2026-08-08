import { useTheme } from '../../../theme/DirectionContext';
import { rangeDefault } from '../../../lib/inquirySchema';
import { formatMoney } from '../../../lib/money';

// Two native <input type="range"> overlaid on one track.
//
// This replaces a ~300-line hand-rolled pointer implementation whose thumbs
// were <button>s with no key handler — meaning the budget question could not
// be answered by keyboard at all. Native inputs bring arrow keys, Home/End,
// touch, and correct screen-reader announcement for free; the cost is that the
// thumbs have to be styled through ::-webkit-slider-thumb / ::-moz-range-thumb
// in src/styles/forms.css, which is not expressible as inline React styles.
//
// The trade: you can no longer type an exact figure, so someone above the
// slider's ceiling can only express the ceiling. Accepted — the range is a
// signal for Tawny, not a contract.
export default function RangeInput({ f, value, onChange, id }) {
  const t = useTheme();
  const [lo, hi] = value && value.length === 2 ? value : rangeDefault(f);

  const pct = v => ((v - f.min) / (f.max - f.min)) * 100;
  // Each thumb is clamped by the other so the pair can never invert.
  const setLo = v => onChange(f.name, [Math.min(Number(v), hi), hi]);
  const setHi = v => onChange(f.name, [lo, Math.max(Number(v), lo)]);

  const endpoint = {
    fontFamily: t.fonts.display,
    fontSize: 'clamp(22px, 2.6vw, 30px)',
    color: t.palette.emerald,
    lineHeight: 1.1,
  };
  const micro = {
    fontFamily: t.eyebrowFont, fontSize: 9.5, fontWeight: 600,
    letterSpacing: '0.22em', textTransform: 'uppercase', color: t.fgFaint,
  };

  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minInlineSize: 'auto' }}>
      <legend className="tcf-label" id={id}>
        {f.label}
        {f.required && <span className="tcf-req">REQUIRED</span>}
      </legend>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 24 }}>
        <span style={endpoint}>{formatMoney(lo)}</span>
        <span style={{
          fontFamily: t.wordmark.ampersandFamily, fontStyle: 'italic',
          fontSize: 17, color: t.fgFaint,
        }}>to</span>
        <span style={endpoint}>{formatMoney(hi)}</span>
      </div>

      <div className="tcf-range">
        <div className="tcf-track">
          <i style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
        </div>
        <input
          type="range" min={f.min} max={f.max} step={f.step} value={lo}
          aria-label={`${f.label}, minimum`}
          aria-valuetext={formatMoney(lo)}
          onChange={e => setLo(e.target.value)}
        />
        <input
          type="range" min={f.min} max={f.max} step={f.step} value={hi}
          aria-label={`${f.label}, maximum`}
          aria-valuetext={formatMoney(hi)}
          onChange={e => setHi(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', ...micro }}>
        <span>Min · {formatMoney(f.min)}</span>
        <span>Max · {formatMoney(f.max)}</span>
      </div>
    </fieldset>
  );
}
