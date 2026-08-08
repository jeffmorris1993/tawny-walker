import { useEffect, useRef } from 'react';
import { allFields } from '../../lib/inquirySchema';
import { fieldId } from './fields/fieldId';

// Shown at the top of a step when Continue is blocked. Two jobs: tell someone
// using a screen reader that the step failed (the inline messages alone are
// easy to miss further down the page), and give a keyboard user a direct jump
// to each offending field.
export default function ErrorSummary({ errors, service, nonce }) {
  const ref = useRef(null);
  const keys = Object.keys(errors || {}).filter(k => errors[k]);

  useEffect(() => {
    if (keys.length && ref.current) ref.current.focus();
  }, [nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!keys.length) return null;

  const byName = new Map(allFields(service).map(f => [f.name, f]));

  return (
    <div className="tcf-summary" role="alert" tabIndex={-1} ref={ref}>
      <h3>
        {keys.length === 1 ? 'One field needs attention' : `${keys.length} fields need attention`}
      </h3>
      <ul>
        {keys.map(name => (
          <li key={name}>
            <button
              type="button"
              onClick={() => document.getElementById(fieldId(name))?.focus()}
            >
              {byName.get(name)?.label || name}
            </button>
            {': '}{errors[name]}
          </li>
        ))}
      </ul>
    </div>
  );
}
