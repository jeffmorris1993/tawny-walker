import { useRef, useState } from 'react';
import { useTheme } from '../../theme/DirectionContext';
import { supabase } from '../../lib/supabase';

// Manages the listing's photo gallery: file pick, upload to Supabase
// Storage, drag-to-reorder, and remove. Photos are an ordered array of
// { path, url } objects on the listing row's `photos` column. The first
// entry is treated as the hero by the public detail page.
//
// Props:
//   value     []         current photos array (controlled)
//   onChange  fn(next)   replace photos array
//   listingId string?    used in the storage path; falls back to `_drafts`
//                        for unsaved listings so uploads don't collide.
const BUCKET = 'listing-photos';
// Client-side guardrails — match the Supabase Storage bucket settings
// (10 MB cap + image MIME whitelist) so a too-big or wrong-type file
// fails locally with a friendly message instead of round-tripping.
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export default function PhotoUploader({ value = [], onChange, listingId }) {
  const t = useTheme();

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(0);   // count of in-flight uploads
  const [uploadError, setUploadError] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  // Per-URL flag flipped to true once the <img> finishes loading. Drives
  // a shimmer overlay so the tile reads as a skeleton until the photo
  // is paintable.
  const [loadedMap, setLoadedMap] = useState({});

  function pickFiles() {
    fileInputRef.current?.click();
  }

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    if (!supabase) {
      setUploadError('Supabase storage not configured.');
      return;
    }
    setUploadError(null);
    const folder = listingId || '_drafts';
    const uploaded = [];
    setUploading(c => c + files.length);
    // try/finally so a thrown network/storage error can never leave the
    // counter elevated (which would freeze the "Uploading…" CTA).
    try {
      for (const file of files) {
        // Reject before the network round-trip: oversized or wrong-type
        // files surface a friendly error in the UI instead of waiting on a
        // server reject.
        if (file.size > MAX_BYTES) {
          setUploadError('Photos must be 10 MB or smaller.');
          continue;
        }
        if (!ALLOWED_TYPES.has(file.type)) {
          setUploadError('JPEG, PNG, WebP, or AVIF only.');
          continue;
        }
        // Path: listing-photos/{listingId}/{timestamp}-{slug}.{ext}
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const slug = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40) || 'photo';
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${slug}.${ext}`;
        try {
          const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
            cacheControl: '3600',
            contentType: file.type || undefined,
          });
          if (upErr) {
            console.error('[tw] photo upload failed', upErr);
            setUploadError(upErr.message || 'Upload failed.');
            continue;
          }
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
          uploaded.push({ path, url: pub.publicUrl });
        } catch (err) {
          console.error('[tw] photo upload threw', err);
          setUploadError(err?.message || 'Upload failed.');
        }
      }
    } finally {
      setUploading(c => Math.max(0, c - files.length));
    }
    if (uploaded.length) {
      onChange?.([...(value || []), ...uploaded]);
    }
  }

  async function removeAt(i) {
    const next = (value || []).filter((_, j) => j !== i);
    const removed = (value || [])[i];
    onChange?.(next);
    // Best-effort cleanup of the storage object — the listing is the source
    // of truth, so a failed delete just leaves an orphan, not a broken UI.
    if (removed?.path && supabase) {
      supabase.storage.from(BUCKET).remove([removed.path]).catch(() => {});
    }
  }

  function onDragStart(i) {
    setDragIndex(i);
  }
  function onDragOver(e) { e.preventDefault(); }
  function onDropOn(i) {
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null);
      return;
    }
    const next = [...(value || [])];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(i, 0, moved);
    onChange?.(next);
    setDragIndex(null);
  }

  // Keyboard / touch fallback for reorder — drag-and-drop is unusable on
  // iPad and inaccessible to keyboard users, so each tile also exposes
  // left/right arrow buttons that swap with the adjacent tile.
  function moveBy(i, delta) {
    const next = [...(value || [])];
    const j = i + delta;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange?.(next);
  }

  const isBusy = uploading > 0;

  const labelStyle = {
    position: 'absolute', top: 14, right: 14, padding: '6px 12px',
    background: '#fff',
    fontFamily: t.eyebrowFont,
    fontSize: 9.5, fontWeight: 600,
    letterSpacing: '0.26em',
    textTransform: 'uppercase',
    color: t.palette.emerald,
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => {
          handleFiles(Array.from(e.target.files || []));
          e.target.value = ''; // allow re-picking the same file
        }}
      />

      {/* Uniform photo grid — every tile (including the +Add cell) shares the
          same 3:2 aspect so hero and supporting shots read at one size. The
          first tile is still the hero; drag any cell to reorder. */}
      <div className="tw-photo-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
      }}>
        {(value || []).map((p, i) => {
          const loaded = !!loadedMap[p.url];
          return (
            <div
              key={p.path || p.url || i}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={onDragOver}
              onDrop={() => onDropOn(i)}
              style={{
                position: 'relative', aspectRatio: '3 / 2',
                background: t.bgPanel, border: `1px solid ${t.line}`,
                overflow: 'hidden', cursor: 'grab',
                opacity: dragIndex === i ? 0.6 : 1,
              }}
            >
              {!loaded && (
                <div
                  className="tw-photo-skel"
                  aria-hidden
                  style={{ position: 'absolute', inset: 0 }}
                />
              )}
              <img
                src={p.url}
                alt={i === 0 ? 'Hero' : `Photo ${i + 1}`}
                onLoad={() => setLoadedMap(m => ({ ...m, [p.url]: true }))}
                onError={() => setLoadedMap(m => ({ ...m, [p.url]: true }))}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  opacity: loaded ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }}
              />
              {i === 0 && loaded && <div style={labelStyle}>Hero · drag to reorder</div>}
              <div style={{
                position: 'absolute', top: 8, left: 8,
                display: 'flex', gap: 4,
              }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); moveBy(i, -1); }}
                  disabled={i === 0}
                  aria-label={`Move photo ${i + 1} earlier`}
                  style={{
                    ...moveBtnStyle,
                    opacity: i === 0 ? 0.35 : 1,
                    cursor: i === 0 ? 'not-allowed' : 'pointer',
                  }}
                >‹</button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); moveBy(i, +1); }}
                  disabled={i === (value || []).length - 1}
                  aria-label={`Move photo ${i + 1} later`}
                  style={{
                    ...moveBtnStyle,
                    opacity: i === (value || []).length - 1 ? 0.35 : 1,
                    cursor: i === (value || []).length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >›</button>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeAt(i); }}
                aria-label={`Remove photo ${i + 1}`}
                style={{ ...removeBtnStyle, top: 8, right: 8, width: 24, height: 24, fontSize: 15 }}
              >×</button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={pickFiles}
          style={{
            aspectRatio: '3 / 2',
            background: t.bgPanel, border: `1px dashed ${t.line}`,
            display: 'grid', placeItems: 'center',
            fontFamily: t.eyebrowFont,
            fontSize: 10.5, fontWeight: 600,
            letterSpacing: '0.26em',
            textTransform: 'uppercase', color: t.fgFaint,
            cursor: isBusy ? 'wait' : 'pointer',
          }}
        >{isBusy ? 'Uploading…' : (value?.length ? '+ Add' : '+ Add photos')}</button>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .tw-photo-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @keyframes tw-photo-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .tw-photo-skel {
          background: linear-gradient(90deg, #ECE6D8 0%, #F4EFE2 50%, #ECE6D8 100%);
          background-size: 200% 100%;
          animation: tw-photo-shimmer 1.4s ease-in-out infinite;
        }
      `}</style>

      <div style={{
        marginTop: 10,
        fontFamily: t.eyebrowFont, fontSize: 10.5,
        letterSpacing: '0.2em',
        textTransform: 'uppercase', color: t.fgFaint,
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <span>{(value || []).length} photo{(value || []).length === 1 ? '' : 's'} · drag tiles to reorder</span>
        {uploadError && <span style={{ color: '#9B2A1F' }}>{uploadError}</span>}
      </div>
    </div>
  );
}

const removeBtnStyle = {
  position: 'absolute', top: 8, right: 8,
  width: 26, height: 26, borderRadius: '50%',
  background: 'rgba(15,15,12,0.7)', color: '#fff',
  border: 'none', cursor: 'pointer',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: 16, lineHeight: 1,
  display: 'grid', placeItems: 'center',
};

// Mirrors removeBtnStyle but lives at top-left — used for the keyboard /
// touch reorder arrows so they read as a matching set with the × remove.
const moveBtnStyle = {
  width: 24, height: 24, borderRadius: '50%',
  background: 'rgba(15,15,12,0.7)', color: '#fff',
  border: 'none',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  fontSize: 15, lineHeight: 1,
  display: 'grid', placeItems: 'center',
};
