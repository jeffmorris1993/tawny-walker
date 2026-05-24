// Returns the value as a string, or an em-dash if it's null, undefined,
// or whitespace-only. Used everywhere we render a listing field that the
// studio might have left blank in the editor — DB returns '' for those,
// so a simple `??` defaults to the empty string rather than the dash.
export function dashIfBlank(value, dash = '—') {
  if (value === null || value === undefined) return dash;
  const s = String(value);
  if (s.trim() === '') return dash;
  return s;
}
