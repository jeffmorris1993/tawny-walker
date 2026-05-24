import { useEffect, useState } from 'react';

// Returns a debounced copy of `value`. If an `onCommit` callback is
// provided, it runs once each time the debounce fires — useful for
// page-1 resets piggy-backing on the same timer (so search-as-you-type
// doesn't trigger a double fetch).
//
// Example:
//   const [query, setQuery] = useState('');
//   const debouncedQuery = useDebouncedValue(query, 200, () => setPage(1));
export default function useDebouncedValue(value, delay = 200, onCommit) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => {
      setDebounced(value);
      if (onCommit) onCommit(value);
    }, delay);
    return () => clearTimeout(id);
    // We intentionally omit onCommit from the deps so the caller can pass a
    // fresh closure each render without re-triggering the debounce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay]);
  return debounced;
}
