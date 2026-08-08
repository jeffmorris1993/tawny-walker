// Sends a lead-notification email via Resend whenever an inquiry is
// submitted. Triggered by a Supabase database webhook on
// Database → Webhooks → INSERT on **lead_events**, target = this function.
//
// Why lead_events and not leads: one person is one `leads` row, so a repeat
// inquiry from someone already in the system is an UPDATE, not an INSERT —
// a webhook on `leads` would miss it entirely. Meanwhile joining the contact
// list now INSERTs a `leads` row, which a webhook on `leads` would announce
// as an inquiry with an empty intake. `submit_inquiry()` writes exactly one
// lead_events row of kind 'inquiry' per submission, first-time or repeat, so
// firing on that covers both cases and nothing else.
//
// Required secret: RESEND_API_KEY (set in Supabase → Edge Functions →
// Manage secrets). Domain `tawnyandco.com` must be verified in Resend.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected; the service
// role is needed to read the lead behind the event (anon has no SELECT).
//
// Returns 200 for payloads we don't care about so Supabase doesn't retry
// pointlessly. Returns 5xx on lead-fetch or Resend failures so the webhook
// does retry (Supabase webhooks have built-in retry with backoff).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SITE_URL = "https://www.tawnyandco.com";
const FROM = "Tawny & Co. <noreply@tawnyandco.com>";
const TO = ["tawny2walker@gmail.com"];
const BCC = ["morristechnologies1@gmail.com"];

interface IntakeRow {
  q: string;
  a: string;
}

type LeadRole =
  | "Buyer" | "Seller" | "Investor" | "Agent"
  | "Design" | "Exploring" | "Contact";

// The stored role values are terse enough to read badly in a sentence —
// "New Exploring inquiry" and "New Agent inquiry" both want expanding.
const ROLE_LABEL: Record<LeadRole, string> = {
  Buyer: "Buyer",
  Seller: "Seller",
  Investor: "Investor",
  Agent: "Agent / Broker",
  Design: "Design & Renovation",
  Exploring: "Still Exploring",
  Contact: "Contact",
};

function roleLabel(role: string): string {
  return ROLE_LABEL[role as LeadRole] ?? role;
}

interface LeadRecord {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  mandate_notes: string | null;
  intake: IntakeRow[] | null;
  list_source: string | null;
  list_interests: string[] | null;
  created_at: string;
}

interface LeadEventRecord {
  id: string;
  lead_id: string;
  kind: string;
  previous_value: string | null;
  next_value: string | null;
  actor_name: string | null;
  created_at: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: LeadEventRecord | null;
  old_record: LeadEventRecord | null;
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    // Not exploitable today (every attribute context here is double-quoted),
    // but the content is attacker-supplied and one single-quoted attribute
    // would turn this into HTML injection in the studio's inbox.
    .replace(/'/g, "&#39;");
}

// Mirror the admin LeadDetail page: name + email/phone in the header,
// then the intake Q&A list (the actual content the lead submitted),
// then mandate notes. Studio note + audit log are intentionally
// excluded — they're studio-private.
function renderEmail(lead: LeadRecord, isRepeat: boolean) {
  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(" ").trim() || "Unnamed lead";
  const label = roleLabel(lead.role);
  // A returning contact is worth flagging in the subject line — it means
  // there's history in the studio log worth reading before replying.
  const subject = isRepeat
    ? `Repeat ${label} inquiry from ${fullName}`
    : `New ${label} inquiry from ${fullName}`;
  const adminUrl = `${SITE_URL}/admin/lead/${lead.id}`;

  const intake = Array.isArray(lead.intake) ? lead.intake : [];
  const intakeHtml = intake.length
    ? intake.map((row) => `
      <tr>
        <td style="padding:14px 24px 14px 0;vertical-align:top;font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.24em;text-transform:uppercase;color:#7A7A7A;width:170px;border-bottom:1px solid #F0EDE5;">${escapeHtml(row.q)}</td>
        <td style="padding:14px 0;vertical-align:top;font-family:Georgia,serif;font-size:18px;color:#0B3D2E;line-height:1.4;border-bottom:1px solid #F0EDE5;">${escapeHtml(row.a)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="2" style="padding:14px 0;font-family:'Inter',sans-serif;font-size:14px;color:#7A7A7A;font-style:italic;">No intake details captured.</td></tr>`;

  const mandateSection = lead.mandate_notes && lead.mandate_notes.trim().length
    ? `
    <div style="margin-top:32px;">
      <div style="font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.28em;text-transform:uppercase;color:#B49B68;margin-bottom:14px;">Mandate notes</div>
      <div style="padding:20px 24px;background:#F8F5EF;border:1px solid #E8E4DC;font-family:Georgia,serif;font-style:italic;font-size:18px;line-height:1.55;color:#0B3D2E;white-space:pre-wrap;">${escapeHtml(lead.mandate_notes)}</div>
    </div>
  ` : "";

  const html = `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:40px 20px;background:#F8F5EF;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E4DC;">
    <tr><td style="padding:36px 44px;">
      <div style="font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.28em;text-transform:uppercase;color:#B49B68;margin-bottom:12px;">${escapeHtml(label)} Intake${isRepeat ? " · Returning" : ""} · Tawny &amp; Co.</div>
      <h1 style="font-family:Georgia,serif;font-weight:400;font-size:32px;line-height:1.15;color:#0B3D2E;margin:0 0 18px;">${escapeHtml(fullName)}</h1>
      <div style="font-family:'Inter',sans-serif;font-size:14px;color:#0B3D2E;margin-bottom:28px;">
        ${lead.email ? `<a href="mailto:${escapeHtml(lead.email)}" style="color:#0B3D2E;text-decoration:none;font-weight:600;">${escapeHtml(lead.email)}</a>` : "<span style=\"color:#7A7A7A;\">no email</span>"}
        <span style="color:#7A7A7A;margin:0 8px;">·</span>
        ${lead.phone ? `<a href="tel:${escapeHtml(lead.phone)}" style="color:#0B3D2E;text-decoration:none;font-weight:600;">${escapeHtml(lead.phone)}</a>` : "<span style=\"color:#7A7A7A;\">no phone</span>"}
      </div>
      <div style="font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.28em;text-transform:uppercase;color:#B49B68;margin-bottom:6px;">The intake</div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${intakeHtml}</table>
      ${mandateSection}
      <div style="margin-top:36px;padding-top:24px;border-top:1px solid #E8E4DC;">
        <a href="${adminUrl}" style="display:inline-block;padding:14px 24px;background:#0B3D2E;color:#FFFFFF;text-decoration:none;font-family:'Inter',sans-serif;font-size:10.5px;font-weight:600;letter-spacing:0.26em;text-transform:uppercase;">View in studio →</a>
      </div>
    </td></tr>
  </table>
</body></html>`;

  const intakeText = intake.length
    ? intake.map((r) => `${r.q}\n  ${r.a}`).join("\n\n")
    : "(No intake details captured.)";
  const text = `${isRepeat ? "Repeat" : "New"} ${label} intake from ${fullName}
${lead.email || "no email"} · ${lead.phone || "no phone"}

The intake:
${intakeText}
${lead.mandate_notes && lead.mandate_notes.trim().length ? `\nMandate notes:\n${lead.mandate_notes}\n` : ""}
View in studio: ${adminUrl}
`;

  return { subject, html, text };
}

// A list signup has no intake and no mandate, so it gets its own short note
// rather than the inquiry layout with empty tables in it.
function renderListSignupEmail(lead: LeadRecord) {
  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(" ").trim() || "Someone";
  const subject = `New list signup from ${fullName}`;
  const adminUrl = `${SITE_URL}/admin/lead/${lead.id}`;
  const source = (lead.list_source || "the site").replace(/-/g, " ");
  const interests = Array.isArray(lead.list_interests) ? lead.list_interests : [];

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:12px 24px 12px 0;vertical-align:top;font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.24em;text-transform:uppercase;color:#7A7A7A;width:130px;border-bottom:1px solid #F0EDE5;">${escapeHtml(label)}</td>
      <td style="padding:12px 0;vertical-align:top;font-family:Georgia,serif;font-size:17px;color:#0B3D2E;line-height:1.4;border-bottom:1px solid #F0EDE5;">${value}</td>
    </tr>`;

  const html = `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:40px 20px;background:#F8F5EF;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E4DC;">
    <tr><td style="padding:36px 44px;">
      <div style="font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.28em;text-transform:uppercase;color:#B49B68;margin-bottom:12px;">The Tawny &amp; Co. List</div>
      <h1 style="font-family:Georgia,serif;font-weight:400;font-size:32px;line-height:1.15;color:#0B3D2E;margin:0 0 22px;">${escapeHtml(fullName)}</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
        ${row("Email", lead.email ? `<a href="mailto:${escapeHtml(lead.email)}" style="color:#0B3D2E;text-decoration:none;">${escapeHtml(lead.email)}</a>` : "<span style=\"color:#7A7A7A;\">none</span>")}
        ${row("Phone", lead.phone ? `<a href="tel:${escapeHtml(lead.phone)}" style="color:#0B3D2E;text-decoration:none;">${escapeHtml(lead.phone)}</a>` : "<span style=\"color:#7A7A7A;\">none</span>")}
        ${row("Joined via", escapeHtml(source))}
        ${interests.length ? row("Interested in", escapeHtml(interests.join(" · "))) : ""}
      </table>
      <p style="font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:1.6;color:#5A5A5A;margin:24px 0 0;">
        They asked to hear about listings and the market. This is not an inquiry, so there is nothing to reply to yet.
      </p>
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #E8E4DC;">
        <a href="${adminUrl}" style="display:inline-block;padding:14px 24px;background:#0B3D2E;color:#FFFFFF;text-decoration:none;font-family:'Inter',sans-serif;font-size:10.5px;font-weight:600;letter-spacing:0.26em;text-transform:uppercase;">View in studio →</a>
      </div>
    </td></tr>
  </table>
</body></html>`;

  const text = `New list signup from ${fullName}
${lead.email || "no email"} · ${lead.phone || "no phone"}
Joined via ${source}${interests.length ? `\nInterested in: ${interests.join(" · ")}` : ""}

They asked to hear about listings and the market. This is not an inquiry, so there is nothing to reply to yet.

View in studio: ${adminUrl}
`;

  return { subject, html, text };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not set");
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500 });
  }
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
    return new Response(JSON.stringify({ error: "Missing Supabase credentials" }), { status: 500 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  // Bail early on anything that isn't a submitted inquiry — 200 so Supabase
  // doesn't keep retrying a payload we don't care about. This is what keeps
  // studio notes, status changes, and list-only signups silent.
  const kind = payload.record?.kind;
  if (
    payload.type !== "INSERT" ||
    payload.table !== "lead_events" ||
    !payload.record ||
    (kind !== "inquiry" && kind !== "list_signup")
  ) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Re-read the event from the database rather than trusting the body.
  //
  // This endpoint is reachable by anyone: it is deployed with JWT
  // verification, but the *public* anon key satisfies that. Taking `lead_id`
  // and `previous_value` straight from the request would let a caller point
  // the notification at any lead they could name and choose whether it read
  // as a repeat. Verifying against the stored row means a forged payload has
  // to carry a real event id, which is never exposed anywhere public.
  const { data: event, error: eventError } = await supabase
    .from("lead_events")
    .select("id, lead_id, kind, previous_value")
    .eq("id", payload.record.id)
    .maybeSingle();

  if (eventError) {
    console.error("event fetch failed", eventError);
    return new Response(
      JSON.stringify({ error: "Event fetch failed", detail: eventError.message }),
      { status: 502 },
    );
  }
  if (!event || event.kind !== kind) {
    console.warn("no matching event for payload", payload.record.id);
    return new Response(
      JSON.stringify({ skipped: true, reason: "event not found" }),
      { status: 200 },
    );
  }

  // Derived from the stored row, not from the caller.
  const isRepeat = Boolean(event.previous_value);

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id, first_name, last_name, email, phone, role, mandate_notes, intake, list_source, list_interests, created_at")
    .eq("id", event.lead_id)
    .maybeSingle();

  if (leadError) {
    // 502 so the webhook retries — a transient read failure shouldn't lose
    // the notification for a real inquiry.
    console.error("lead fetch failed", leadError);
    return new Response(
      JSON.stringify({ error: "Lead fetch failed", detail: leadError.message }),
      { status: 502 },
    );
  }
  if (!lead) {
    // The lead is gone (deleted between event and delivery). Nothing to
    // retry toward, so 200.
    console.warn("no lead for event", event.lead_id);
    return new Response(JSON.stringify({ skipped: true, reason: "lead not found" }), { status: 200 });
  }

  const { subject, html, text } = kind === "list_signup"
    ? renderListSignupEmail(lead as LeadRecord)
    : renderEmail(lead as LeadRecord, isRepeat);

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: TO,
      bcc: BCC,
      // Letting her hit Reply and write straight back to the lead is the
      // single biggest speed-to-lead lever. Skipped if no email captured.
      reply_to: lead.email || undefined,
      subject,
      html,
      text,
    }),
  });

  if (!resendRes.ok) {
    const errBody = await resendRes.text();
    console.error("Resend error", resendRes.status, errBody);
    return new Response(
      JSON.stringify({ error: "Resend failed", status: resendRes.status, body: errBody }),
      { status: 502 },
    );
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
