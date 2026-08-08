import { Link } from 'react-router-dom';
import { useTheme } from '../theme/DirectionContext';
import { formVars, FORM_ERROR } from '../theme/formVars';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import SEO from '../components/SEO';
import useInquiryWizard from '../components/inquiry/useInquiryWizard';
import InquiryAside from '../components/inquiry/InquiryAside';
import InquiryProgress from '../components/inquiry/InquiryProgress';
import ErrorSummary from '../components/inquiry/ErrorSummary';
import Confirmation from '../components/inquiry/Confirmation';
import {
  StepDirection, StepAbout, StepDetails, StepReview,
} from '../components/inquiry/InquirySteps';
import { STEP_DIRECTION, STEP_ABOUT, STEP_DETAILS, STEP_REVIEW } from '../lib/inquirySchema';

// The guided inquiry. Unlisted: reachable by a link Tawny sends or a QR code,
// noindex, off the sitemap — not linked from the site's navigation. The one
// exception is the listing detail page's "arrange a private viewing" CTA,
// which deep-links here as ?as=buyer.
//
// This page is a shell. State lives in useInquiryWizard, the questions live in
// src/data/inquiryServices.js, and the rules over them live in
// src/lib/inquirySchema.js.
export default function Inquiry() {
  const t = useTheme();
  const w = useInquiryWizard();

  const sending = w.status === 'sending';

  const body = (
    <div className="tw-inquiry-body" style={{
      background: t.bgPage,
      padding: 'clamp(30px, 5vw, 72px) clamp(24px, 4vw, 64px) clamp(36px, 4vw, 64px)',
      display: 'flex', flexDirection: 'column',
    }}>
      <InquiryProgress step={w.step} service={w.service} />

      {/* Keyed on step+direction so each step animates in, and so autoFocus
          re-evaluates rather than sticking to the first step's field. */}
      <div className="tcf-fade" key={`${w.step}:${w.serviceKey}`} style={{ marginTop: 'clamp(30px, 4vw, 46px)', flex: 1 }}>
        <ErrorSummary errors={w.errors} service={w.service} nonce={w.errorNonce} />

        {w.step === STEP_DIRECTION && (
          <StepDirection serviceKey={w.serviceKey} onPick={w.pick} />
        )}
        {w.step === STEP_ABOUT && (
          <StepAbout service={w.service} values={w.values} errors={w.errors} onChange={w.setValue} />
        )}
        {w.step === STEP_DETAILS && (
          <StepDetails service={w.service} values={w.values} errors={w.errors} onChange={w.setValue} />
        )}
        {w.step === STEP_REVIEW && (
          <StepReview service={w.service} values={w.values} onEditStep={w.goToStep} />
        )}
      </div>

      {/* Honeypot — off-screen, never display:none. */}
      <div aria-hidden="true" style={{
        position: 'absolute', left: '-10000px', top: 'auto',
        width: 1, height: 1, overflow: 'hidden',
      }}>
        <label>
          Company name (leave blank)
          <input
            type="text" name="company" tabIndex={-1} autoComplete="organization"
            value={w.honeypot} onChange={e => w.setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <div className="tw-inquiry-nav" style={{
        marginTop: 'clamp(30px, 4vw, 46px)', paddingTop: 26,
        borderTop: `1px solid ${t.line}`,
        display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'space-between',
      }}>
        {w.step > STEP_DIRECTION ? (
          <button type="button" className="tcf-btn tcf-btn-ghost" onClick={w.back}>← Back</button>
        ) : (
          <span style={{ fontSize: 11.5, color: t.fgFaint, letterSpacing: '0.04em' }}>
            A few questions · about two minutes
          </span>
        )}

        {w.step > STEP_DIRECTION && (
          <button type="button" className="tcf-btn" onClick={w.next} disabled={sending}>
            {w.step === STEP_REVIEW ? (sending ? 'Sending…' : 'Send to Tawny →') : 'Continue →'}
          </button>
        )}
      </div>

      {w.status === 'error' && (
        <p role="alert" style={{ fontSize: 12.5, lineHeight: 1.55, color: FORM_ERROR, marginTop: 16 }}>
          {w.throttled
            ? 'This has been sent a few times already. Please try again in an hour, or call the studio.'
            : 'Something went wrong sending this. Please try again, or call the studio.'}
        </p>
      )}

      {/* Auto-subscribe notice. Stated plainly rather than hidden in a
          pre-checked box — and with no unsubscribe promise, because there is
          no unsubscribe link behind it yet. */}
      <p style={{ fontSize: 11.5, lineHeight: 1.65, color: t.fgFaint, margin: '18px 0 0', maxWidth: 560 }}>
        Shared with Tawny only, never sold and never passed to a third party. Tawny
        will also add you to her contact list, so she can share listings and
        market notes from time to time. By sending, you agree to our{' '}
        <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy Policy</Link>.
      </p>
    </div>
  );

  return (
    <div className="tcf" style={{ ...formVars(t), background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <SEO
        title="Private Inquiry"
        description="A private inquiry form for Tawny & Co. clients."
        path="/inquiry"
        noindex
      />
      <TopNav active="" />

      {w.status === 'success' ? (
        <Confirmation service={w.service} values={w.values} />
      ) : (
        <div className="tw-inquiry-split" style={{
          display: 'grid', gridTemplateColumns: '1fr 1.12fr', alignItems: 'stretch',
        }}>
          <InquiryAside service={w.service} step={w.step} />
          {body}
        </div>
      )}

      <SiteFooter />

      <style>{`
        /* Mobile: one column, and the form comes FIRST. The editorial aside is
           context, not a gate — making someone scroll past a photo and a pull
           quote to reach the first question is how a form gets abandoned. */
        @media (max-width: 900px) {
          .tw-inquiry-split      { grid-template-columns: 1fr !important; }
          .tw-inquiry-aside      { order: 2; }
          .tw-inquiry-body       { order: 1; }
          .tw-inquiry-aside-photo { display: none; }
          .tw-inquiry-aside-foot { padding-top: 24px !important; }
          .tw-confirm-body       { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .tw-confirm-row        { grid-template-columns: 1fr !important; gap: 4px !important; }
          .tw-inquiry-nav        { flex-direction: column-reverse !important; align-items: stretch !important; }
          .tw-inquiry-nav .tcf-btn { width: 100%; }
          .tw-card-choose        { display: none; }
          .tcf-card              { grid-template-columns: auto 1fr !important; gap: 16px !important; padding: 18px !important; }
          .tw-confirm-actions .tcf-btn { width: 100%; }
        }
      `}</style>
    </div>
  );
}
