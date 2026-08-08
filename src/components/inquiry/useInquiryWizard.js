import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SERVICES, SERVICE_BY_PARAM } from '../../data/inquiryServices';
import {
  buildInitialValues, validateStep,
  STEP_DIRECTION, STEP_ABOUT, STEP_REVIEW,
} from '../../lib/inquirySchema';
import { submitInquiry } from '../../lib/queries';

// Same trap as the list signup. A four-step wizard takes far longer than 2.5s
// to complete by hand, so this costs a real person nothing — it exists to
// catch a script replaying the submit directly.
const MIN_SUBMIT_MS = 2500;

export default function useInquiryWizard() {
  const [searchParams, setSearchParams] = useSearchParams();

  // ?as=buyer|seller|investor|agent|design|exploring deep-links a direction.
  // An unrecognised value falls back to the card grid and is stripped, rather
  // than leaving a misleading param in a link someone might share.
  const paramService = SERVICE_BY_PARAM[searchParams.get('as') || ''];

  const [serviceKey, setServiceKey] = useState(paramService?.key || null);
  const [step, setStep] = useState(paramService ? STEP_ABOUT : STEP_DIRECTION);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');   // idle | sending | success | error
  const [errorNonce, setErrorNonce] = useState(0);
  const [honeypot, setHoneypot] = useState('');
  const [throttled, setThrottled] = useState(false);
  const mountedAt = useRef(0);

  const service = serviceKey ? SERVICES[serviceKey] : null;

  // Each path has its own field set, so switching direction rebuilds the
  // answers — carrying the previous path's values across would submit
  // questions the person was never shown. Done in `pick` rather than in an
  // effect on serviceKey: an effect would set state during commit and trigger
  // a second render pass for no reason, and `pick` is the only place the
  // direction can change after mount.
  const [values, setValues] = useState(() => buildInitialValues(service));

  useEffect(() => {
    mountedAt.current = Date.now();
    if (searchParams.get('as') && !paramService) {
      const next = new URLSearchParams(searchParams);
      next.delete('as');
      setSearchParams(next, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = useMemo(
    () => Object.entries(values).some(([, v]) => Array.isArray(v) ? v.length : (v && !Array.isArray(v) && String(v).trim())),
    [values],
  );

  // Step is deliberately NOT in the URL. Putting it there would make the back
  // button walk the wizard, but a refresh would then restore step 4 with an
  // empty form — worse than the alternative. The cost is that back exits the
  // page, so guard against losing typed answers.
  useEffect(() => {
    if (!dirty || status === 'success') return undefined;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty, status]);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setErrors(prev => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }, []);

  const pick = useCallback((key) => {
    setServiceKey(key);
    setValues(buildInitialValues(SERVICES[key]));
    setErrors({});
    setStep(STEP_ABOUT);
    const next = new URLSearchParams(searchParams);
    next.set('as', SERVICES[key].param);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const goToStep = useCallback((n) => { setErrors({}); setStep(n); }, []);
  const back = useCallback(() => { setErrors({}); setStep(s => Math.max(0, s - 1)); }, []);

  const submit = useCallback(async () => {
    if (status === 'sending') return;

    // Both traps report success without writing anything, so an automated
    // caller gets no signal about which check it failed.
    if (honeypot || Date.now() - mountedAt.current < MIN_SUBMIT_MS) {
      setStatus('success');
      return;
    }

    setStatus('sending');
    const { error } = await submitInquiry({ serviceKey, values });
    // A 429 is the server refusing a repeat, not a failure. "Try again" is
    // actively wrong advice for it.
    setThrottled(error?.code === '429');
    setStatus(error ? 'error' : 'success');
    if (!error) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [honeypot, serviceKey, status, values]);

  const next = useCallback(() => {
    const found = validateStep(service, step, values);
    const real = Object.keys(found).filter(k => found[k]);
    if (real.length) {
      setErrors(found);
      // Bumped so the summary re-announces itself even when the same fields
      // fail twice in a row.
      setErrorNonce(n => n + 1);
      return;
    }
    setErrors({});
    if (step === STEP_REVIEW) { submit(); return; }
    setStep(s => Math.min(STEP_REVIEW, s + 1));
  }, [service, step, values, submit]);

  return {
    step, service, serviceKey, values, errors, status, errorNonce, throttled,
    honeypot, setHoneypot,
    setValue, pick, next, back, goToStep,
  };
}
