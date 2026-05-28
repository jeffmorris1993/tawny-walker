import { useEffect, useState } from 'react';

// Returns `true` once every src in the list has finished loading (or
// errored — a broken url shouldn't strand the page on a skeleton). Pages
// use this to keep the skeleton grid up until all card photography is in
// the browser cache, so the swap to real cards is single-frame instead of
// "skeleton gone, images popping in".
//
// Readiness is derived from a key (joined srcs) rather than a boolean
// flag, so changing the list (paging, filtering) immediately reads as
// "not ready" without a flash of stale ready=true between renders.
export default function useImagesPreloaded(srcs) {
  const targets = (srcs || []).filter(Boolean);
  const key = targets.join('|');
  const [loadedKey, setLoadedKey] = useState(targets.length === 0 ? key : null);

  useEffect(() => {
    if (targets.length === 0) { setLoadedKey(key); return undefined; }
    let cancelled = false;
    let remaining = targets.length;
    const onDone = () => {
      remaining -= 1;
      if (remaining === 0 && !cancelled) setLoadedKey(key);
    };
    targets.forEach((src) => {
      const img = new Image();
      img.onload = onDone;
      img.onerror = onDone;
      img.src = src;
      // Cached images may have completed before the listeners attached;
      // count them straight away so the hook doesn't stall.
      if (img.complete && img.naturalWidth > 0) onDone();
    });
    return () => { cancelled = true; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return loadedKey === key;
}
