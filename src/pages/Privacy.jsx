import { useTheme } from '../theme/DirectionContext';
import TopNav from '../components/TopNav';
import SiteFooter from '../components/SiteFooter';
import Eyebrow from '../components/Eyebrow';
import Rule from '../components/Rule';
import SEO from '../components/SEO';
import { STUDIO } from '../data/listings';

const EFFECTIVE_DATE = 'June 10, 2026';
const PRIVACY_EMAIL = STUDIO.email;

const SECTIONS = [
  {
    h: '1. Who we are',
    body: [
      `Tawny & Co. is a real estate practice operated by Tawny Walker, ${STUDIO.brokeredBy}. This Privacy Policy explains what information we collect through www.tawnyandco.com (the "Site"), how we use it, and the rights you have over it. References to "we," "us," and "our" mean Tawny & Co.`,
    ],
  },
  {
    h: '2. Information we collect',
    body: [
      'We collect only what you give us through the Site and a small amount of standard technical data needed to operate it.',
      'Information you submit through the inquiry form: your name, email address, phone number, role (buyer, seller, investor, or renovator), the details you choose to share about your property goals, budget, timeline, location preferences, and any free-text notes.',
      'Technical information collected automatically by our hosting and database providers: IP address, browser type, pages visited, and timestamps. This is used for security and basic operations, not advertising profiles.',
      'We do not knowingly collect information from anyone under 18. The Site is intended for adults inquiring about real estate services.',
    ],
  },
  {
    h: '3. How we use your information',
    body: [
      'To respond to your inquiry and provide the real estate services you have asked about.',
      'To maintain client records as required by Michigan real estate licensing rules and our brokerage.',
      'To send transactional follow-ups directly related to your inquiry (for example, scheduling a viewing or confirming a meeting). We do not add you to marketing lists.',
      'To detect and prevent fraud, abuse of the Site, and security incidents.',
    ],
  },
  {
    h: '4. Legal basis (for visitors in the EU/UK/EEA)',
    body: [
      'Where the GDPR or UK GDPR applies, we rely on the following legal bases: (a) your consent, given when you voluntarily submit the inquiry form, and (b) our legitimate interest in responding to you and operating the Site securely. You can withdraw consent at any time by emailing the address in Section 11; withdrawal does not affect the lawfulness of processing carried out before withdrawal.',
    ],
  },
  {
    h: '5. Who we share information with',
    body: [
      'We do not sell your personal information and we do not share it with marketers.',
      'We rely on the following service providers ("sub-processors") to operate the Site. Each is bound by a written data-protection agreement:',
      '· Supabase, Inc. — database and edge-function hosting for the inquiry submissions.',
      '· Vercel, Inc. — website hosting and content delivery.',
      '· Resend, Inc. — email delivery for inquiry notifications and monthly backup exports.',
      `We may also disclose information to our brokerage (${STUDIO.brokeredBy}) when required by our supervisory and licensing obligations, and to legal or regulatory authorities when required by law.`,
    ],
  },
  {
    h: '6. International data transfers',
    body: [
      'Our service providers are based in the United States. When you submit information from outside the United States, your data is transferred to and stored on servers located in the U.S. We rely on the European Commission\'s Standard Contractual Clauses (and the UK International Data Transfer Addendum where applicable) with each sub-processor to provide appropriate safeguards for these transfers.',
    ],
  },
  {
    h: '7. How long we keep your information',
    body: [
      'We keep inquiry records for as long as you remain an active or recent prospect, and for at least three (3) years after our last substantive contact so we can comply with brokerage record-keeping and respond to disputes. After that period we delete or anonymize the records, except where a longer retention is required by law (for example, tax or licensing records).',
      'You can ask us to delete your information sooner; see Section 9.',
    ],
  },
  {
    h: '8. How we protect your information',
    body: [
      'The Site uses HTTPS for data in transit. Inquiry data is stored in an encrypted database with row-level security policies that restrict access to authenticated staff. Administrative routes are protected behind authentication. No system is perfectly secure, but we apply reasonable technical and organizational measures appropriate to the limited and non-sensitive nature of the information we collect.',
    ],
  },
  {
    h: '9. Your rights',
    body: [
      'Depending on where you live, you may have the right to:',
      '· request a copy of the personal information we hold about you;',
      '· ask us to correct inaccurate information;',
      '· ask us to delete your information ("right to erasure");',
      '· ask us to restrict or object to certain uses;',
      '· receive your information in a portable format;',
      '· withdraw consent at any time, and',
      '· lodge a complaint with your local data protection authority.',
      `To exercise any of these rights, email ${PRIVACY_EMAIL} from the address you used to submit your inquiry. We will respond within 30 days. We do not charge a fee for reasonable requests.`,
    ],
  },
  {
    h: '10. Cookies and tracking',
    body: [
      'The Site uses only the cookies and local-storage entries strictly necessary to operate (for example, remembering your theme preference and keeping you signed in if you are an authorized administrator). We do not use third-party advertising cookies, behavioral profiling, or cross-site tracking pixels.',
    ],
  },
  {
    h: '11. Contact us',
    body: [
      `Questions about this policy, or to exercise any of the rights above, please contact: ${PRIVACY_EMAIL}.`,
      `Mailing address: ${STUDIO.address.join(', ')}.`,
    ],
  },
  {
    h: '12. Changes to this policy',
    body: [
      'We may update this Privacy Policy from time to time. When we make a material change, we will update the "Effective" date at the top of this page. Continued use of the Site after the update means you accept the revised policy.',
    ],
  },
];

export default function Privacy() {
  const t = useTheme();
  const emerald = t.palette.emerald;

  return (
    <div style={{ background: t.bgPage, fontFamily: t.fonts.body, color: t.fgPage }}>
      <SEO
        title="Privacy Policy"
        description="How Tawny & Co. collects, uses, and protects information submitted through tawnyandco.com."
        path="/privacy"
      />
      <TopNav active="" />

      {/* MASTHEAD */}
      <div style={{
        padding: 'clamp(56px, 7vw, 96px) clamp(20px, 5vw, 72px) clamp(32px, 4vw, 56px)',
        textAlign: 'center',
      }}>
        <Eyebrow>Legal</Eyebrow>
        <h1 style={{
          fontFamily: t.fonts.display, fontWeight: 300,
          fontSize: 'clamp(48px, 7vw, 96px)', letterSpacing: '-0.025em',
          margin: '24px auto 0', lineHeight: 0.95, color: emerald, maxWidth: 1100,
        }}>
          Privacy <em style={{ fontStyle: 'italic' }}>Policy.</em>
        </h1>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}><Rule /></div>
        <div style={{
          marginTop: 20,
          fontFamily: t.eyebrowFont, fontSize: 10.5, fontWeight: 600,
          letterSpacing: '0.32em', textTransform: 'uppercase', color: t.fgFaint,
        }}>
          Effective · {EFFECTIVE_DATE}
        </div>
      </div>

      {/* BODY */}
      <div style={{
        padding: '0 clamp(20px, 5vw, 72px) clamp(64px, 9vw, 120px)',
        maxWidth: 820, margin: '0 auto',
      }}>
        <p style={{
          fontFamily: t.fonts.display, fontStyle: 'italic', fontWeight: 400,
          fontSize: 'clamp(18px, 1.9vw, 22px)', lineHeight: 1.5,
          color: emerald, margin: 0,
        }}>
          We collect what is necessary to respond to an inquiry, keep proper brokerage records, and operate this site securely. We do not sell your information.
        </p>

        {SECTIONS.map((section, i) => (
          <section key={section.h} style={{ marginTop: i === 0 ? 56 : 40 }}>
            <h2 style={{
              fontFamily: t.fonts.display, fontWeight: 400,
              fontSize: 'clamp(22px, 2.4vw, 28px)', letterSpacing: '-0.012em',
              color: emerald, margin: 0, lineHeight: 1.2,
            }}>
              {section.h}
            </h2>
            {section.body.map((para, j) => (
              <p key={j} style={{
                fontSize: 15.5, lineHeight: 1.75, color: t.fgMuted,
                margin: j === 0 ? '16px 0 0' : '12px 0 0',
              }}>
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>

      <SiteFooter />
    </div>
  );
}
