import { NextResponse } from "next/server";

/**
 * Receives the contact form.
 * - If ENQUIRY_WEBHOOK_URL is set (Slack, Formspree, Zapier, Make ...), the message is forwarded there.
 * - If not, it answers { mode: "mailto" } and the page opens the visitor's mail app instead.
 */
export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const data = {
    kind: s(b.kind, 60),
    name: s(b.name, 120),
    email: s(b.email, 200),
    phone: s(b.phone, 60),
    budget: s(b.budget, 60),
    work: s(b.work, 40),
    message: s(b.message, 4000),
  };

  if (b.company) return NextResponse.json({ mode: "sent" }); // honeypot: pretend it worked
  if (!data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.message.length < 5) {
    return NextResponse.json({ error: "Please fill in name, a valid email and a message." }, { status: 400 });
  }

  const hook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!hook) return NextResponse.json({ mode: "mailto" });

  const text = [
    `New enquiry: ${data.kind}`,
    data.work ? `Work: ${data.work}` : null,
    `From: ${data.name} <${data.email}>`,
    data.phone ? `Phone / WhatsApp: ${data.phone}` : null,
    data.budget ? `Budget: ${data.budget}` : null,
    "",
    data.message,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  try {
    const r = await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...data, text }),
    });
    if (!r.ok) throw new Error(`webhook ${r.status}`);
    return NextResponse.json({ mode: "sent" });
  } catch {
    return NextResponse.json({ mode: "mailto" });
  }
}
