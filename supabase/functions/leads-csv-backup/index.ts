// Emails a CSV snapshot of public.leads to morristechnologies1@gmail.com.
// Triggered monthly by pg_cron + pg_net (see migration that schedules it),
// or invokable manually with a valid Supabase JWT for a fresh export.
//
// Required secret: RESEND_API_KEY (already configured for lead-notify).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected by the
// edge runtime; the service role is needed to bypass RLS on `leads`.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const FROM = "Tawny & Co. <noreply@tawnyandco.com>";
const TO = ["morristechnologies1@gmail.com"];

// CSV escape: wrap in double quotes when the value contains a comma,
// quote, or newline; double any internal quotes per RFC 4180.
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "string" ? value : JSON.stringify(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// Base64-encode a UTF-8 string. btoa() alone is latin-1 only, so multi-
// byte chars (em-dashes in mandate notes, accented names) would corrupt
// — round-trip through TextEncoder first.
function toBase64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  if (!RESEND_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
    console.error("Missing required env vars");
    return new Response(JSON.stringify({ error: "Missing env" }), { status: 500 });
  }

  // Service role client — required to bypass RLS on `leads` (which only
  // grants SELECT to authenticated, not anon).
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, role, first_name, last_name, email, phone, status, tone, stars, summary, mandate_notes, studio_note, studio_note_saved_at, intake, created_at, updated_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Lead fetch failed", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const columns = [
    "id", "role", "first_name", "last_name", "email", "phone",
    "status", "tone", "stars", "summary", "mandate_notes",
    "studio_note", "studio_note_saved_at", "intake",
    "created_at", "updated_at",
  ] as const;

  type LeadRow = Record<(typeof columns)[number], unknown>;
  const rows = (leads as LeadRow[] | null) || [];
  const csvLines = [
    columns.join(","),
    ...rows.map((row) => columns.map((c) => csvEscape(row[c])).join(",")),
  ];
  // CRLF per RFC 4180; helps Excel parse line breaks reliably.
  const csv = csvLines.join("\r\n");

  const now = new Date();
  const stamp = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const filename = `tawny-leads-${stamp}.csv`;
  const total = rows.length;
  const subject = `Leads backup — ${stamp} (${total} ${total === 1 ? "row" : "rows"})`;

  const resendRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: TO,
      subject,
      text: `Monthly leads export attached.

File: ${filename}
Rows: ${total}
Generated: ${now.toISOString()}
`,
      attachments: [{ filename, content: toBase64Utf8(csv) }],
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

  return new Response(JSON.stringify({ ok: true, rows: total, filename }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
