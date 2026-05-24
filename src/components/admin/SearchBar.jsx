import { forwardRef } from 'react';
import { useTheme } from '../../theme/DirectionContext';

// Shared search row used by the admin Leads + Listings tables. Quiet
// line-only input with a magnifier icon, an italic helper count, and a
// clear button that only appears once the user has typed something.
//
// Props:
//   value           controlled input string
//   onChange        (next) => void
//   placeholder     the editorial query prompt
//   helperText      e.g. "9 leads" or "2 matches in 9 leads"
//   onClear         optional () => void; renders the × button when present
const SearchBar = forwardRef(function SearchBar(
  { value, onChange, placeholder, helperText, onClear },
  ref,
) {
  const t = useTheme();
  return (
    <div ref={ref} style={{
      display: 'flex', alignItems: 'flex-end', gap: 16,
      marginTop: 28, scrollMarginTop: 24,
    }}>
      <span
        style={{ color: t.fgFaint, paddingBottom: 14, display: 'grid', placeItems: 'center' }}
        aria-hidden
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="10" cy="10" r="6.5" />
          <path d="M19 19l-4.5-4.5" />
        </svg>
      </span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        style={{
          flex: 1, minWidth: 0,
          background: 'transparent', border: 0, outline: 'none',
          padding: '6px 0 10px',
          borderBottom: `1px solid ${t.line}`,
          fontFamily: t.fonts.display, fontWeight: 400,
          fontSize: 'clamp(20px, 2vw, 26px)',
          color: t.palette.emerald,
        }}
        onFocus={e => { e.currentTarget.style.borderBottomColor = t.palette.emerald; }}
        onBlur={e => { e.currentTarget.style.borderBottomColor = t.line; }}
      />
      <span style={{
        fontFamily: t.fonts.display, fontStyle: 'italic',
        fontSize: 14, color: t.fgFaint,
        paddingBottom: 14, whiteSpace: 'nowrap',
      }}>{helperText}</span>
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          style={{
            background: 'none', border: 0, color: t.fgFaint, fontSize: 20,
            cursor: 'pointer', padding: '4px 6px 10px', lineHeight: 1,
          }}
        >×</button>
      )}
    </div>
  );
});

export default SearchBar;
