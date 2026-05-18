import { useTheme } from '../../theme/DirectionContext';
import Eyebrow from '../Eyebrow';
import Photo from '../Photo';
import { LISTINGS } from '../../data/listings';

// Renders the studio's private record of listings tied to a lead.
// `attached` is `[{ id, name?, tone?, sharedAt }]`. If `id` matches a listing
// in the public LISTINGS data, that listing's tone + name is used.
//
// `onRemove(id)` / `onAttach()` are optional. When omitted the buttons are
// still rendered so the design reads correctly in screenshots.
export default function AttachedListings({ attached = [], onRemove, onAttach }) {
  const t = useTheme();
  const isB = t.key === 'B';
  const noun = t.admin.attachedNoun;

  const resolve = (a) => {
    const ref = LISTINGS.find(l => l.id === a.id);
    return {
      name: a.name || ref?.addr || 'Untitled',
      tone: a.tone || ref?.tone || 'warm',
    };
  };

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
        {t.admin.attachedNounPlural[0].toUpperCase() + t.admin.attachedNounPlural.slice(1)} you have personally tied to this lead — a private record of what you've shared.
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
                  color: isB ? t.palette.emerald : t.fgPage,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{name}</div>
                <div style={{
                  fontFamily: t.eyebrowFont,
                  fontSize: isB ? 9.5 : 10,
                  fontWeight: isB ? 600 : 400,
                  letterSpacing: isB ? '0.22em' : '0.2em',
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
          background: isB ? t.bgPanel : t.bgPage,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: t.eyebrowFont,
          fontSize: isB ? 10 : 10.5,
          fontWeight: isB ? 600 : 400,
          letterSpacing: isB ? '0.24em' : '0.24em',
          textTransform: 'uppercase',
          color: isB ? t.palette.emerald : t.fgPage,
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
        fontSize: isB ? 9.5 : 10,
        fontWeight: isB ? 500 : 400,
        letterSpacing: isB ? '0.22em' : '0.2em',
        textTransform: 'uppercase',
        color: t.fgFaint, marginTop: 10, textAlign: 'center',
      }}>Opens your {t.admin.attachedNounPlural} index · pick one</div>
    </div>
  );
}
