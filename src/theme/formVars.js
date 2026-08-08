// Bridges the theme object to the CSS custom properties that
// src/styles/forms.css reads.
//
// The stylesheet exists only for things inline styles cannot express
// (pseudo-elements, :focus-visible, range thumbs, reduced-motion). Keeping
// its colours behind variables set from here means themes.js stays the single
// source of truth and forms.css never hardcodes a palette.
//
// Spread onto the `style` of any element carrying the `tcf` class:
//   <div className="tcf" style={formVars(t)}> … </div>
export function formVars(t) {
  return {
    '--tcf-emerald':      t.palette.emerald,
    '--tcf-emerald-deep': t.palette.emeraldDeep,
    '--tcf-gold':         t.palette.gold,
    '--tcf-gold-soft':    t.palette.goldSoft,
    '--tcf-ink':          t.palette.ink,
    '--tcf-ink2':         t.palette.ink2,
    '--tcf-ink3':         t.palette.ink3,
    '--tcf-ink4':         t.palette.ink4,
    '--tcf-line':         t.line,
    '--tcf-line-soft':    t.lineSoft,
    '--tcf-paper':        t.bgPanel,
    '--tcf-display':      t.fonts.display,
    '--tcf-body':         t.fonts.body,
  };
}

// The one colour with no theme token: form error red. Exported so JSX that
// needs it inline (an error message, an invalid border) matches the
// stylesheet exactly rather than drifting to a second shade of red.
export const FORM_ERROR = '#8C4A4A';
