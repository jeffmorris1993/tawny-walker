import { useEffect, useRef } from 'react';
import { useTheme } from '../../theme/DirectionContext';

// Editorial replacement for window.confirm / window.alert. Centered card
// over a soft scrim, themed to match the rest of the studio. ESC and
// backdrop click both invoke the cancel action.
//
// Props:
//   open          (bool) whether the dialog is visible
//   title         (string) headline displayed in Cormorant/Playfair
//   message       (string | node) supporting copy
//   confirmLabel  primary button label   (defaults to "Confirm")
//   cancelLabel   secondary button label (defaults to "Cancel")
//   onConfirm     async/sync callback for primary action
//   onCancel      callback for backdrop/ESC/cancel
//   danger        (bool) renders the primary in a destructive style
//   busy          (bool) disables buttons during an in-flight action
export default function ConfirmDialog({
  open, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  onConfirm, onCancel,
  danger = false, busy = false,
}) {
  const t = useTheme();

  // Refs for focus management — the cancel button receives initial focus
  // (safer default for destructive dialogs), and Tab cycles between the
  // two action buttons so focus can never escape the dialog.
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape' && !busy && onCancel) onCancel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  // Body scroll lock + focus capture/restore + initial focus on cancel.
  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Defer to next tick so the buttons are mounted before we focus.
    const id = setTimeout(() => {
      (cancelRef.current || confirmRef.current)?.focus();
    }, 0);
    return () => {
      clearTimeout(id);
      document.body.style.overflow = prevOverflow;
      try {
        const prev = previouslyFocusedRef.current;
        if (prev && typeof prev.focus === 'function' && document.contains(prev)) {
          prev.focus();
        }
      } catch {
        /* best-effort — the trigger may have unmounted */
      }
    };
  }, [open]);

  // Two-button focus trap: Tab/Shift+Tab cycles cancel ↔ confirm.
  function onDialogKeyDown(e) {
    if (e.key !== 'Tab') return;
    const cancelEl = cancelRef.current;
    const confirmEl = confirmRef.current;
    // If only one is present, just keep focus on it.
    if (!cancelEl || !confirmEl) {
      const lone = cancelEl || confirmEl;
      if (lone) { e.preventDefault(); lone.focus(); }
      return;
    }
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === cancelEl) { e.preventDefault(); confirmEl.focus(); }
      else if (active !== confirmEl) { e.preventDefault(); confirmEl.focus(); }
    } else {
      if (active === confirmEl) { e.preventDefault(); cancelEl.focus(); }
      else if (active !== cancelEl) { e.preventDefault(); cancelEl.focus(); }
    }
  }

  if (!open) return null;

  const ink     = t.palette.emerald;
  const onInk   = '#FFFFFF';
  const danger0 = '#9B2A1F';
  const dangerFg = '#FFFFFF';

  const primaryBg = danger ? danger0 : ink;
  const primaryFg = danger ? dangerFg : onInk;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => !busy && onCancel && onCancel()}
      onKeyDown={onDialogKeyDown}
      style={{
        position: 'fixed', inset: 0, zIndex: 250,
        background: 'rgba(15, 15, 12, 0.55)',
        display: 'grid', placeItems: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          background: t.bgPage, border: `1px solid ${t.line}`,
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.4)',
          padding: '28px 32px 28px',
        }}
      >
        {title && (
          <h2 style={{
            fontFamily: t.fonts.display, fontWeight: 400,
            fontSize: 'clamp(22px, 2.4vw, 28px)', margin: 0,
            letterSpacing: '-0.012em',
            color: t.palette.emerald, lineHeight: 1.2,
          }}>{title}</h2>
        )}
        {message && (
          <div style={{
            marginTop: 14,
            fontFamily: t.fonts.body, fontSize: 14, lineHeight: 1.6,
            color: t.fgMuted,
          }}>{message}</div>
        )}
        <div style={{
          marginTop: 28, display: 'flex', justifyContent: 'flex-end',
          gap: 10, flexWrap: 'wrap',
        }}>
          {onCancel && (
            <button
              ref={cancelRef}
              type="button"
              onClick={onCancel}
              disabled={busy}
              style={{
                padding: '10px 22px',
                background: 'transparent',
                border: `1px solid ${t.line}`,
                color: t.fgMuted,
                fontFamily: t.eyebrowFont,
                fontSize: 10.5, fontWeight: 600,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.5 : 1,
              }}
            >{cancelLabel}</button>
          )}
          {onConfirm && (
            <button
              ref={confirmRef}
              type="button"
              onClick={onConfirm}
              disabled={busy}
              style={{
                padding: '10px 22px',
                background: primaryBg,
                border: `1px solid ${primaryBg}`,
                color: primaryFg,
                fontFamily: t.eyebrowFont,
                fontSize: 10.5, fontWeight: 600,
                letterSpacing: '0.26em',
                textTransform: 'uppercase',
                cursor: busy ? 'wait' : 'pointer',
                opacity: busy ? 0.7 : 1,
              }}
            >{busy ? 'Working…' : confirmLabel}</button>
          )}
        </div>
      </div>
    </div>
  );
}
