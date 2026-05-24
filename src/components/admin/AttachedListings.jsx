import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../Eyebrow';
import Photo from '../Photo';

// Renders the studio's private record of listings tied to a lead.
// `attached` is `[{ id, name?, tone?, sharedAt }]`. Each row supplies its
// own name/tone via the lead query's joined listings columns; this view
// only renders what the API returns.
//
// `onRemove(id)` / `onAttach()` are optional. When omitted the buttons are
// still rendered so the design reads correctly in screenshots.
export default function AttachedListings({ attached = [], onRemove, onAttach }) {
  const t = useTheme();
  const noun = t.admin.attachedNoun;

  const resolve = (a) => ({
    name: a.name || 'Untitled',
    tone: a.tone || 'warm',
  });

  return (
    <div style={{ marginTop: 32, padding: 24, border: `1px solid ${t.line}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Eyebrow>Attached {t.admin.attachedNounPlural}</Eyebrow>
        <span style={{
          fontFamily: t.fonts.display, fontStyle: 'italic',
          fontSize: 13, color: t.fgFaint,
        }}>{attached.length} attached</span>
      </div>
      <div style={{
        fontFamily: t.fonts.display, fontStyle: 'italic',
        fontSize: 14, color: t.fgFaint, marginTop: 6, lineHeight: 1.5,
      }}>
        {t.admin.attachedNounPlural[0].toUpperCase() + t.admin.attachedNounPlural.slice(1)} you have personally tied to this lead. A private record of what you've shared.
      </div>

      <div style={{ marginTop: 14 }}>
        {attached.map((a) => {
          const { name, tone } = resolve(a);
          return (
            <div key={a.id} style={{
              display: 'flex', gap: 12, padding: '12px 0',
              borderBottom: `1px solid ${t.lineSoft}`, alignItems: 'center',
            }}>
              <div style={{ width: 44, height: 44, flexShrink: 0 }}>
                <Photo label="" tone={tone} height="100%" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: t.fonts.display, fontSize: 17,
                  color: t.palette.emerald,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{name}</div>
                <div style={{
                  fontFamily: t.eyebrowFont,
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase', color: t.fgFaint,
                }}>Shared with lead · {a.sharedAt}</div>
              </div>
              <button
                onClick={() => onRemove && onRemove(a.id)}
                aria-label={`Detach ${name}`}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontSize: 14, color: t.fgFaint, padding: '0 4px',
                }}
              >×</button>
            </div>
          );
        })}
      </div>

      <button
        onClick={onAttach}
        style={{
          marginTop: 14, padding: '14px 16px', width: '100%',
          border: `1px dashed ${t.line}`,
          background: t.bgPanel,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: t.eyebrowFont,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: t.palette.emerald,
          cursor: 'pointer',
        }}
      >
        <span style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontStyle: 'italic', fontSize: 18,
        }}>+</span>
        Attach a {noun}
      </button>
      <div style={{
        fontFamily: t.eyebrowFont,
        fontSize: 9.5,
        fontWeight: 500,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: t.fgFaint, marginTop: 10, textAlign: 'center',
      }}>Opens your {t.admin.attachedNounPlural} index · pick one</div>
    </div>
  );
}
