// Sends a lead-notification email via Resend whenever a new row is
// inserted into public.leads. Triggered by a Supabase database webhook
// (Database → Webhooks → INSERT on leads, target = this function URL).
//
// Required secret: RESEND_API_KEY (set in Supabase → Edge Functions →
// Manage secrets). Domain `tawnyandco.com` must be verified in Resend.
//
// Returns 200 for non-INSERT or wrong-table payloads so Supabase doesn't
// retry pointlessly. Returns 5xx on Resend failures so the webhook
// retries (Supabase webhooks have built-in retry with backoff).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = "https://www.tawnyandco.com";
const FROM = "Tawny & Co. <noreply@tawnyandco.com>";
const TO = ["tawny2walker@gmail.com"];
const BCC = ["morristechnologies1@gmail.com"];

interface IntakeRow {
  q: string;
  a: string;
}

interface LeadRecord {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  role: "Buyer" | "Seller" | "Investor" | "Agent";
  mandate_notes: string | null;
  intake: IntakeRow[] | null;
  created_at: string;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: LeadRecord | null;
  old_record: LeadRecord | null;
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Mirror the admin LeadDetail page: name + email/phone in the header,
// then the intake Q&A list (the actual content the lead submitted),
// then mandate notes. Studio note + audit log are intentionally
// excluded — they're studio-private.
function renderEmail(lead: LeadRecord) {
  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(" ").trim() || "Unnamed lead";
  const subject = `New ${lead.role} inquiry — ${fullName}`;
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
      <div style="font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:0.28em;text-transform:uppercase;color:#B49B68;margin-bottom:12px;">${escapeHtml(lead.role)} Intake · Tawny &amp; Co.</div>
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
  const text = `New ${lead.role} intake — ${fullName}
${lead.email || "no email"} · ${lead.phone || "no phone"}

The intake:
${intakeText}
${lead.mandate_notes && lead.mandate_notes.trim().length ? `\nMandate notes:\n${lead.mandate_notes}\n` : ""}
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

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  // Bail early on anything that isn't a new lead — 200 so Supabase
  // doesn't keep retrying a payload we don't care about.
  if (payload.type !== "INSERT" || payload.table !== "leads" || !payload.record) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const { subject, html, text } = renderEmail(payload.record);

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
      reply_to: payload.record.email || undefined,
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
