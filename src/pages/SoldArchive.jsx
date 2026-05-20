import { useMemo } from 'react';
import { useTheme } from '../theme/DirectionContext';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Rule from '../components/Rule';
import { useListings } from '../lib/queries';
import {
  ListingsGridStyles,
  UniformGrid,
  ListingCardStdA, ListingCardStdB,
} from './Listings';

// Mirrors the Listings editorial layout for closed placements only.
// No filter, no sort — read-only historical view.
function useSoldListings() {
  const { data, loading } = useListings();
  const sold = useMemo(() => data.filter(l => l.status === 'Sold'), [data]);
  return { sold, loading };
}

function ArchiveA({ listings }) {
  const t = useTheme();

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <TopNav active="Listings" />

      <div style={{ padding: 'clamp(48px, 6.1vw, 88px) clamp(24px, 4.4vw, 64px) clamp(32px, 3.9vw, 56px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h1 style={{ fontFamily: t.fonts.display, fontWeight: 300, fontSize: 'clamp(52px, 6.7vw, 96px)', letterSpacing: '-0.022em', margin: 0, lineHeight: 0.95 }}>
              Sold <em style={{ fontStyle: 'italic' }}>listings</em>.
            </h1>
          </div>
          <p style={{ maxWidth: 380, textAlign: 'right', fontFamily: t.fonts.display, fontStyle: 'italic', fontSize: 19, color: t.fgMuted, lineHeight: 1.45, margin: 0 }}>
            A selection of recent placements, {listings.length} in total.
          </p>
        </div>
        <div style={{ marginTop: 72, paddingTop: 28, borderTop: `1px solid ${t.line}` }} />
      </div>

      <div style={{ padding: '0 clamp(24px, 4.4vw, 64px) clamp(64px, 8.3vw, 120px)' }}>
        {listings.length === 0 ? (
          <p style={{
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 18, color: t.fgMuted, textAlign: 'center', padding: '64px 0',
          }}>No closed placements yet.</p>
        ) : (
          <UniformGrid>
            {listings.map(l => <ListingCardStdA key={l.id} listing={l} />)}
          </UniformGrid>
        )}
      </div>

      <SiteFooter />
      <ListingsGridStyles />
    </div>
  );
}

function ArchiveB({ listings }) {
  const t = useTheme();

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <TopNav active="Listings" />

      <div style={{ padding: 'clamp(56px, 7vw, 96px) clamp(24px, 5vw, 72px) clamp(32px, 4vw, 56px)', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: t.fonts.display, fontWeight: 300,
          fontSize: 'clamp(52px, 7vw, 96px)', letterSpacing: '-0.024em',
          margin: 0, lineHeight: 0.95, color: t.palette.emerald,
        }}>
          Sold <em style={{ fontStyle: 'italic' }}>listings.</em>
        </h1>
        <p style={{
          fontFamily: t.fonts.display, fontStyle: 'italic',
          fontSize: 20, color: t.fgMuted, maxWidth: 640, margin: '24px auto 0', lineHeight: 1.5,
        }}>
          A selection of recent placements, {listings.length} in total.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
          <Rule />
        </div>
      </div>

      <div style={{ padding: '0 clamp(24px, 5vw, 72px) 120px', maxWidth: 1296, margin: '0 auto' }}>
        {listings.length === 0 ? (
          <p style={{
            fontFamily: t.fonts.display, fontStyle: 'italic',
            fontSize: 18, color: t.fgMuted, textAlign: 'center', padding: '64px 0',
          }}>No closed placements yet.</p>
        ) : (
          <UniformGrid variant="b">
            {listings.map(l => <ListingCardStdB key={l.id} listing={l} />)}
          </UniformGrid>
        )}
      </div>

      <SiteFooter />
      <ListingsGridStyles />
    </div>
  );
}

export default function SoldArchive() {
  const t = useTheme();
  const { sold, loading } = useSoldListings();
  if (loading) {
    return (
      <div style={{ background: t.bgPage, minHeight: '60vh', display: 'grid', placeItems: 'center', color: t.fgFaint, fontFamily: t.fonts.body, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Loading…
      </div>
    );
  }
  return t.key === 'B' ? <ArchiveB listings={sold} /> : <ArchiveA listings={sold} />;
}
