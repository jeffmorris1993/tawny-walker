import { useTheme } from '../theme/DirectionContext';
import { STUDIO } from '../data/listings';
import Wordmark from './Wordmark';

export default function SiteFooter() {
  const t = useTheme();
  const isB = t.key === 'B';

  // B uses an emerald-deep slab, ivory text. A uses warm paper + ink.
  const bg = isB ? t.palette.emeraldDeep : t.palette.paper;
  const fg = isB ? 'rgba(248,245,238,0.7)' : t.fgMuted;
  const fgStrong = isB ? '#fff' : t.fgPage;
  const labelColor = isB ? t.accentSoft : t.fgFaint;
  const ruleColor = isB ? 'rgba(248,245,238,0.14)' : t.line;

  const columns = [
    { h: 'Office', items: [...STUDIO.address, STUDIO.phone, STUDIO.email] },
    { h: 'Explore', items: [`Active ${t.indexNoun}`, 'Sold Archive', 'Buyer Services', 'Seller Services'] },
    { h: isB ? 'Follow' : 'Connect', items: ['Instagram', 'LinkedIn', 'Journal', 'Newsletter'] },
  ];

  return (
    <footer style={{
      padding: '64px 64px 40px',
      borderTop: isB ? 'none' : `1px solid ${t.line}`,
      background: bg, color: fg,
      fontFamily: t.fonts.body,
    }}>
      <div className="tw-footer-grid" style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48,
        maxWidth: 1296, margin: '0 auto',
      }}>
        <div>
          <Wordmark size={26} light={isB} sub={false} />
          <p style={{
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 17, color: isB ? 'rgba(248,245,238,0.78)' : t.fgMuted,
            marginTop: 24, maxWidth: 340, lineHeight: 1.55, fontWeight: 400,
          }}>
            A considered approach to buying, selling, and stewarding property along the Great Lakes coast.
          </p>
        </div>
        {columns.map(col => (
          <div key={col.h}>
            <div style={{
              fontFamily: t.eyebrowFont,
              fontSize: 10.5, fontWeight: isB ? 600 : 400,
              letterSpacing: isB ? '0.32em' : '0.26em',
              textTransform: 'uppercase',
              color: labelColor, marginBottom: 16,
            }}>{col.h}</div>
            {col.items.map(i => (
              <div key={i} style={{
                fontFamily: t.fonts.body, fontSize: 13,
                color: fg, marginBottom: 8, lineHeight: 1.5,
              }}>{i}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        maxWidth: 1296, margin: '32px auto 0',
        paddingTop: 24, borderTop: `1px solid ${ruleColor}`,
        fontFamily: t.eyebrowFont,
        fontSize: 10.5, fontWeight: isB ? 500 : 400,
        letterSpacing: isB ? '0.26em' : '0.18em',
        textTransform: 'uppercase',
        color: isB ? 'rgba(248,245,238,0.45)' : t.fgFaint,
      }}>
        <span>© 2026 Tawny & Co. · {STUDIO.brokeredBy}</span>
        <span>Equal Housing Opportunity</span>
      </div>

      {/* Reserve space so the floating direction toggle never overlaps text */}
      <div style={{ height: 56, opacity: 0, pointerEvents: 'none' }} aria-hidden="true" />

      <style>{`
        @media (max-width: 900px) {
          .tw-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 540px) {
          .tw-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
