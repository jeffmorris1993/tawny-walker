// Wrap every case-insensitive occurrence of `needle` in `text` with a
// styled <mark>. Returned as a React fragment so the surrounding cell can
// keep its own text styling. The mark gets a class so the page can tune
// the highlight color in its own <style> block.
//
// Usage: { highlight(row.name, debouncedQuery, 'tw-mark') }
export function highlight(text, needle, markClass = 'tw-mark') {
  if (!text) return text;
  const s = String(text);
  if (!needle) return s;
  const lower = s.toLowerCase();
  const target = String(needle).toLowerCase();
  if (!target) return s;
  const out = [];
  let i = 0;
  let n = 0;
  while (i < s.length) {
    const idx = lower.indexOf(target, i);
    if (idx === -1) { out.push(s.slice(i)); break; }
    if (idx > i) out.push(s.slice(i, idx));
    out.push(
      <mark key={`m-${n++}`} className={markClass}>{s.slice(idx, idx + target.length)}</mark>
    );
    i = idx + target.length;
  }
  return out;
}
