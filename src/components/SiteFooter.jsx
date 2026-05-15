import { TW } from '../tokens';
import Wordmark from './Wordmark';

export default function SiteFooter() {
  return (
    <div style={{
      padding: '64px 64px 40px',
      borderTop: `1px solid ${TW.line}`,
      background: TW.paper,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: 48,
      }} className="tw-footer-grid">
        <div>
          <Wordmark size={26} />
          <p style={{
            fontFamily: '"Cormorant Garamond", serif', fontSize: 17, fontStyle: 'italic',
            color: TW.ink2, marginTop: 20, maxWidth: 320, lineHeight: 1.5,
          }}>
            A considered approach to buying, selling, and stewarding property along the South Florida coast.
          </p>
        </div>
        {[
          { h: 'Office', items: ['1242 Lincoln Road', 'Miami Beach, FL 33139', 'morristechnologies1@gmail.com'] },
          { h: 'Explore', items: ['Active Listings', 'Sold Archive', 'Buyer Services', 'Seller Services'] },
          { h: 'Connect', items: ['Instagram', 'LinkedIn', 'Journal', 'Newsletter'] },
        ].map(col => (
          <div key={col.h}>
            <div style={{
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              fontSize: 10.5, letterSpacing: '0.26em', textTransform: 'uppercase',
              color: TW.ink3, marginBottom: 16,
            }}>{col.h}</div>
            {col.items.map(i => (
              <div key={i} style={{
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontSize: 13, color: TW.ink2, marginBottom: 8, lineHeight: 1.5,
              }}>{i}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 32,
        paddingTop: 20, borderTop: `1px solid ${TW.line}`,
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: TW.ink3,
        flexWrap: 'wrap', gap: 12,
      }}>
        <span>© 2026 Tawny Walker. License #BK3198472</span>
        <span>Equal Housing Opportunity</span>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .tw-footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .tw-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
