// The DOM id for a field's control, derived from its schema `name`.
//
// Lives in its own module so both the field renderer and the error summary
// import the same function. The summary's "jump to field" buttons call
// document.getElementById(fieldId(name)) — if the two ever computed the id
// differently, those buttons would silently focus nothing.
export function fieldId(name) {
  return `q-${name}`;
}
